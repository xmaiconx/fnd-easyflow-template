#!/usr/bin/env node

/**
 * Script para detectar mudanças e determinar quais apps devem ser buildados
 * Suporta nova estratégia de branches: main (dev), release (staging), production (prod)
 * Uso: node scripts/detect-changes.js [base-commit] [target-commit]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Mapeamento de dependências baseado nos package.json reais
// Adaptado para Gestão Consultório (GC)
// Backend: Build via Jenkins (Docker)
// Frontend: Deploy direto no Cloudflare Pages (não passa pelo Jenkins)
const DEPENDENCY_MAP = {
  apps: {
    'backend': ['app-shared', 'app-database', 'app-infra']
    // frontend não está aqui pois não é buildado pelo Jenkins
  },
  packages: {
    'app-database': ['app-shared'],
    'app-infra': ['app-shared'],
    'app-shared': []  // sem dependências
  }
};

// Configuração da estratégia de branches
const BRANCH_STRATEGY = {
  main: {
    name: 'main',
    environment: 'development',
    buildImages: false,
    description: 'Branch de desenvolvimento - apenas compilação e testes'
  },
  release: {
    name: 'release',
    environment: 'staging',
    buildImages: true,
    description: 'Branch de staging - gera artefatos RC para homologação'
  },
  production: {
    name: 'production',
    environment: 'production',
    buildImages: true,
    description: 'Branch de produção - gera artefatos finais'
  }
};

function getCurrentBranch() {
  try {
    const cmd = 'git rev-parse --abbrev-ref HEAD';
    const output = execSync(cmd, { encoding: 'utf8' });
    return output.trim();
  } catch (error) {
    console.error('Erro ao obter branch atual:', error.message);
    return 'unknown';
  }
}

function getBranchStrategy(branchName) {
  // Verificar branches exatas
  if (BRANCH_STRATEGY[branchName]) {
    return BRANCH_STRATEGY[branchName];
  }
  
  // Verificar padrões de branches
  if (branchName.startsWith('hotfix/')) {
    return {
      name: branchName,
      environment: 'hotfix',
      buildImages: true,
      description: 'Branch de hotfix - gera artefatos para correção urgente'
    };
  }
  
  if (branchName.startsWith('feature/') || branchName.startsWith('feat/')) {
    return {
      name: branchName,
      environment: 'feature',
      buildImages: false,
      description: 'Branch de feature - apenas compilação e testes'
    };
  }
  
  // Default para branches desconhecidas (comportamento como main)
  return {
    name: branchName,
    environment: 'development',
    buildImages: false,
    description: 'Branch desconhecida - apenas compilação e testes'
  };
}

function shouldGenerateArtifacts(branchStrategy, forceBuild = false) {
  return forceBuild || branchStrategy.buildImages;
}

function getLastCommitMessage() {
  try {
    const cmd = 'git log -1 --pretty=%B';
    const output = execSync(cmd, { encoding: 'utf8' });
    return output.trim().toLowerCase();
  } catch (error) {
    console.error('Erro ao obter mensagem do último commit:', error.message);
    return '';
  }
}

function hasDockerForceBuildTag(commitMessage) {
  const forceTags = [
    '[force docker]',
    '[docker force]',
    '[build docker]',
    '[docker build]'
  ];
  
  return forceTags.some(tag => commitMessage.includes(tag));
}

function getChangedFiles(baseCommit, targetCommit) {
  try {
    const cmd = `git diff --name-only ${baseCommit}..${targetCommit}`;
    const output = execSync(cmd, { encoding: 'utf8' });
    return output.trim().split('\n').filter(file => file.length > 0);
  } catch (error) {
    console.error('Erro ao obter arquivos alterados:', error.message);
    return [];
  }
}

function getChangedPackages(changedFiles) {
  const changedPackages = new Set();

  changedFiles.forEach(file => {
    if (file.startsWith('libs/')) {
      const packageName = file.split('/')[1];
      changedPackages.add(packageName);
    }
  });

  return Array.from(changedPackages);
}

function getChangedApps(changedFiles) {
  const changedApps = new Set();
  
  changedFiles.forEach(file => {
    if (file.startsWith('apps/')) {
      const appName = file.split('/')[1];
      changedApps.add(appName);
    }
  });
  
  return Array.from(changedApps);
}

function getAffectedPackages(changedPackages) {
  const affected = new Set(changedPackages);
  
  // Propagar mudanças através das dependências
  let hasChanges = true;
  while (hasChanges) {
    hasChanges = false;
    
    Object.entries(DEPENDENCY_MAP.packages).forEach(([pkg, deps]) => {
      if (!affected.has(pkg) && deps.some(dep => affected.has(dep))) {
        affected.add(pkg);
        hasChanges = true;
      }
    });
  }
  
  return Array.from(affected);
}

function getAffectedApps(changedApps, affectedPackages) {
  const affected = new Set(changedApps);
  
  // Verificar quais apps dependem dos packages alterados
  Object.entries(DEPENDENCY_MAP.apps).forEach(([app, deps]) => {
    if (deps.some(dep => affectedPackages.includes(dep))) {
      affected.add(app);
    }
  });
  
  return Array.from(affected);
}

function shouldBuildApp(appName, affectedApps) {
  return affectedApps.includes(appName);
}

function main() {
  const baseCommit = process.argv[2] || 'HEAD~1';
  const targetCommit = process.argv[3] || 'HEAD';
  
  // Obter informações da branch atual
  const currentBranch = getCurrentBranch();
  const branchStrategy = getBranchStrategy(currentBranch);
  
  // Verificar se o commit contém um coringa para forçar build
  const lastCommitMessage = getLastCommitMessage();
  const forceBuild = hasDockerForceBuildTag(lastCommitMessage);
  
  console.log(`Detectando mudanças entre ${baseCommit} e ${targetCommit}`);
  console.log(`Branch atual: ${currentBranch}`);
  console.log(`Estratégia: ${branchStrategy.description}`);
  console.log(`Ambiente: ${branchStrategy.environment}`);
  console.log(`Gera artefatos: ${shouldGenerateArtifacts(branchStrategy, forceBuild)}`);
  
  if (forceBuild) {
    console.log('\nCoringa de força de build Docker detectado na mensagem do commit!');
    console.log('Forçando build de todas as aplicações...');
    
    // Output para Jenkins com todas as aplicações marcadas para build
    const result = {
      branch: currentBranch,
      branchStrategy: branchStrategy,
      changedFiles: 0,
      changedPackages: [],
      changedApps: [],
      affectedPackages: [],
      affectedApps: [],
      shouldBuild: {
        'backend': true
        // frontend não é buildado pelo Jenkins
      },
      shouldGenerateArtifacts: true,
      forceBuild: true
    };

    // Salvar resultado em arquivo para Jenkins
    fs.writeFileSync('build-matrix.json', JSON.stringify(result, null, 2));

    console.log('\n=== RESULTADO (FORÇADO) ===');
    console.log('Build backend: true (forçado)');
    console.log('Gerar artefatos Docker: true (forçado)');
    console.log('Frontend: Deploy via Cloudflare Pages (não afetado)');
    
    process.exit(0);
    return;
  }
  
  const changedFiles = getChangedFiles(baseCommit, targetCommit);
  console.log('Arquivos alterados:', changedFiles.length);
  
  if (changedFiles.length === 0) {
    console.log('Nenhuma mudança detectada');
    process.exit(0);
  }
  
  const changedPackages = getChangedPackages(changedFiles);
  const changedApps = getChangedApps(changedFiles);
  
  console.log('Packages diretamente alterados:', changedPackages);
  console.log('Apps diretamente alterados:', changedApps);
  
  const affectedPackages = getAffectedPackages(changedPackages);
  const affectedApps = getAffectedApps(changedApps, affectedPackages);
  
  console.log('Packages afetados (incluindo dependências):', affectedPackages);
  console.log('Apps afetados:', affectedApps);
  
  // Determinar se deve gerar artefatos baseado na estratégia da branch
  const generateArtifacts = shouldGenerateArtifacts(branchStrategy, forceBuild);
  
  // Output para Jenkins
  const result = {
    branch: currentBranch,
    branchStrategy: branchStrategy,
    changedFiles: changedFiles.length,
    changedPackages,
    changedApps,
    affectedPackages,
    affectedApps,
    shouldBuild: {
      'backend': shouldBuildApp('backend', affectedApps)
      // frontend não é buildado pelo Jenkins
    },
    shouldGenerateArtifacts: generateArtifacts,
    forceBuild: false
  };

  // Salvar resultado em arquivo para Jenkins
  fs.writeFileSync('build-matrix.json', JSON.stringify(result, null, 2));

  console.log('\n=== RESULTADO ===');
  console.log('Build backend:', result.shouldBuild['backend']);
  console.log('Gerar artefatos Docker:', generateArtifacts);
  console.log('Ambiente:', branchStrategy.environment);
  console.log('Frontend: Deploy via Cloudflare Pages (automático)');
  
  // Exit code baseado se há algo para buildar
  const hasBuilds = Object.values(result.shouldBuild).some(should => should);
  process.exit(hasBuilds ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = {
  getChangedFiles,
  getChangedPackages,
  getChangedApps,
  getAffectedPackages,
  getAffectedApps,
  shouldBuildApp,
  getLastCommitMessage,
  hasDockerForceBuildTag,
  getCurrentBranch,
  getBranchStrategy,
  shouldGenerateArtifacts,
  DEPENDENCY_MAP,
  BRANCH_STRATEGY
};
