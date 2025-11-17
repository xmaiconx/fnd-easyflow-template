#!/usr/bin/env node

/**
 * Script para gerenciar versões baseado em tags Git
 * Adaptado para Gestão Consultório (GC) - 2 apps: backend + frontend
 * Uso: node scripts/version-manager.js [command] [options]
 *
 * Comandos:
 * - get-version [app-name]: Obter versão atual do app
 * - bump-version [app-name] [patch|minor|major]: Incrementar versão
 * - create-tag [app-name] [version]: Criar tag Git
 * - create-tag-safe [app-name] [version]: Criar tag Git com fallback automático para duplicatas
 * - get-latest-tag [app-name]: Obter última tag do app
 *
 * NOVO: create-tag-safe resolve automaticamente conflitos de tags duplicadas
 * incrementando a versão até encontrar uma disponível.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class VersionManager {
  constructor() {
    this.apps = ['backend', 'frontend'];
  }

  /**
   * Executa comando Git e retorna output
   */
  execGit(command) {
    try {
      return execSync(command, { encoding: 'utf8' }).trim();
    } catch (error) {
      console.error(`Erro ao executar: ${command}`);
      console.error(error.message);
      return null;
    }
  }

  /**
   * Obter todas as tags do repositório
   */
  getAllTags() {
    const output = this.execGit('git tag --sort=-version:refname');
    return output ? output.split('\n').filter(tag => tag.length > 0) : [];
  }

  /**
   * Obter última tag de um app específico
   */
  getLatestTag(appName) {
    const tags = this.getAllTags();
    const appTags = tags.filter(tag => tag.startsWith(`${appName}-v`));
    return appTags.length > 0 ? appTags[0] : null;
  }

  /**
   * Extrair versão da tag
   */
  extractVersionFromTag(tag) {
    if (!tag) return null;
    const match = tag.match(/-v(\d+\.\d+\.\d+)$/);
    return match ? match[1] : null;
  }

  /**
   * Obter versão atual do app
   */
  getCurrentVersion(appName) {
    // Primeiro tenta obter do package.json
    const packagePath = path.join('apps', appName, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      return packageJson.version;
    }

    // Se não encontrar, usa a última tag
    const latestTag = this.getLatestTag(appName);
    const version = this.extractVersionFromTag(latestTag);
    return version || '0.1.0';
  }

  /**
   * Incrementar versão semântica
   */
  bumpVersion(currentVersion, type = 'patch') {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    switch (type) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  /**
   * Atualizar package.json com nova versão
   */
  updatePackageVersion(appName, newVersion) {
    const packagePath = path.join('apps', appName, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      packageJson.version = newVersion;
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`Atualizado ${packagePath} para versão ${newVersion}`);
    }
  }

  /**
   * Gerar próxima versão RC
   */
  generateRCVersion(currentVersion) {
    if (currentVersion.includes('-rc.')) {
      // Se já é RC, incrementar o número RC
      const rcMatch = currentVersion.match(/^(.+)-rc\.(\d+)$/);
      if (rcMatch) {
        const baseVersion = rcMatch[1];
        const rcNumber = parseInt(rcMatch[2]) + 1;
        return `${baseVersion}-rc.${rcNumber}`;
      }
    }
    // Se não é RC, adicionar RC.1
    return `${currentVersion}-rc.1`;
  }

  /**
   * Remover sufixo RC da versão
   */
  removeRCSuffix(version) {
    return version.replace(/-rc\.\d+$/, '');
  }

  /**
   * Verificar se uma tag já existe
   */
  tagExists(tagName) {
    const result = this.execGit(`git tag -l "${tagName}"`);
    return result && result.trim() === tagName;
  }

  /**
   * Encontrar próxima versão disponível quando tag já existe
   */
  findNextAvailableVersion(appName, baseVersion) {
    let version = baseVersion;
    let tagName = `${appName}-v${version}`;
    let attempts = 0;
    const maxAttempts = 100;

    while (this.tagExists(tagName) && attempts < maxAttempts) {
      attempts++;
      version = this.bumpVersion(version, 'patch');
      tagName = `${appName}-v${version}`;
      console.log(`Tag ${appName}-v${baseVersion} já existe, tentando: ${tagName}`);
    }

    if (attempts >= maxAttempts) {
      console.error(`Erro: Não foi possível encontrar versão disponível após ${maxAttempts} tentativas`);
      return null;
    }

    return version;
  }

  /**
   * Criar tag Git com fallback de incremento automático
   */
  createTag(appName, version, message = null) {
    const originalVersion = version;
    let finalVersion = version;
    let tagName = `${appName}-v${finalVersion}`;
    
    // Verificar se a tag já existe
    if (this.tagExists(tagName)) {
      console.log(`⚠️  Tag ${tagName} já existe, buscando próxima versão disponível...`);
      
      finalVersion = this.findNextAvailableVersion(appName, version);
      if (!finalVersion) {
        console.error(`❌ Não foi possível encontrar versão disponível para ${appName}`);
        return null;
      }
      
      tagName = `${appName}-v${finalVersion}`;
      console.log(`✅ Versão disponível encontrada: ${tagName}`);
      
      // Se a versão mudou, atualizar o package.json também
      if (finalVersion !== originalVersion) {
        console.log(`📦 Atualizando package.json de ${appName} para versão ${finalVersion}`);
        this.updatePackageVersion(appName, finalVersion);
      }
    }
    
    const tagMessage = message || `Release ${appName} v${finalVersion}`;
    const command = `git tag -a "${tagName}" -m "${tagMessage}"`;
    const result = this.execGit(command);
    
    if (result !== null) {
      console.log(`✅ Tag criada com sucesso: ${tagName}`);
      if (finalVersion !== originalVersion) {
        console.log(`📝 Versão incrementada automaticamente: ${originalVersion} → ${finalVersion}`);
      }
      return tagName;
    }
    
    console.error(`❌ Erro ao criar tag: ${tagName}`);
    return null;
  }

  /**
   * Obter hash do commit atual
   */
  getCurrentCommitHash() {
    return this.execGit('git rev-parse --short HEAD');
  }

  /**
   * Gerar versão Docker baseada na branch e versão
   */
  generateDockerVersion(appName, branch = 'main') {
    const currentVersion = this.getCurrentVersion(appName);
    const commitHash = this.getCurrentCommitHash();
    
    if (branch === 'production') {
      return currentVersion;  // v1.2.3 (versão final)
    } else if (branch === 'release') {
      // Se já é RC, manter; se não, adicionar RC
      if (currentVersion.includes('-rc.')) {
        return currentVersion;  // v1.2.3-rc.1 (já é RC)
      } else {
        return `${currentVersion}-rc.1`;  // v1.2.3-rc.1 (adicionar RC)
      }
    } else if (branch === 'main') {
      return currentVersion;  // v1.2.3 (sem artefatos, mas versão limpa)
    } else if (branch.startsWith('hotfix/')) {
      return `${currentVersion}-hotfix.${commitHash}`;  // v1.2.3-hotfix.abc123
    } else {
      return `${currentVersion}-${commitHash}`;  // v1.2.3-abc123 (outras branches)
    }
  }

  /**
   * Processar comando da linha de comando
   */
  processCommand() {
    const [,, command, ...args] = process.argv;
    
    switch (command) {
      case 'get-version': {
        const appName = args[0];
        if (!appName || !this.apps.includes(appName)) {
          console.error('App name required:', this.apps.join(', '));
          process.exit(1);
        }
        const version = this.getCurrentVersion(appName);
        console.log(version);
        break;
      }
      
      case 'bump-version': {
        const appName = args[0];
        const bumpType = args[1] || 'patch';
        
        if (!appName || !this.apps.includes(appName)) {
          console.error('App name required:', this.apps.join(', '));
          process.exit(1);
        }
        
        const currentVersion = this.getCurrentVersion(appName);
        const newVersion = this.bumpVersion(currentVersion, bumpType);
        
        this.updatePackageVersion(appName, newVersion);
        console.log(`${appName}: ${currentVersion} → ${newVersion}`);
        break;
      }
      
      case 'create-tag': {
        const appName = args[0];
        const version = args[1];
        
        if (!appName || !version) {
          console.error('App name and version required');
          process.exit(1);
        }
        
        const tag = this.createTag(appName, version);
        if (tag) {
          console.log(`Tag criada: ${tag}`);
        } else {
          process.exit(1);
        }
        break;
      }
      
      case 'create-tag-safe': {
        const appName = args[0];
        const version = args[1];
        
        if (!appName || !version) {
          console.error('App name and version required');
          console.error('Uso: node scripts/version-manager.js create-tag-safe <app-name> <version>');
          process.exit(1);
        }
        
        console.log(`🏷️  Criando tag para ${appName} v${version} (com fallback automático)...`);
        const tag = this.createTag(appName, version);
        if (tag) {
          console.log(`✅ Tag criada com sucesso: ${tag}`);
          // Retornar apenas o nome da tag para uso em scripts
          if (process.env.CI || process.env.JENKINS_URL) {
            console.log(`TAG_CREATED=${tag}`);
          }
        } else {
          console.error(`❌ Falha ao criar tag para ${appName} v${version}`);
          process.exit(1);
        }
        break;
      }
      
      case 'get-latest-tag': {
        const appName = args[0];
        if (!appName || !this.apps.includes(appName)) {
          console.error('App name required:', this.apps.join(', '));
          process.exit(1);
        }
        const tag = this.getLatestTag(appName);
        console.log(tag || 'No tags found');
        break;
      }
      
      case 'docker-version': {
        const appName = args[0];
        const branch = args[1] || 'main';
        
        if (!appName || !this.apps.includes(appName)) {
          console.error('App name required:', this.apps.join(', '));
          process.exit(1);
        }
        
        const dockerVersion = this.generateDockerVersion(appName, branch);
        console.log(dockerVersion);
        break;
      }
      
      case 'set-version': {
        const appName = args[0];
        const newVersion = args[1];
        
        if (!appName || !this.apps.includes(appName)) {
          console.error('App name required:', this.apps.join(', '));
          process.exit(1);
        }
        
        if (!newVersion) {
          console.error('Version required (e.g., 1.2.3)');
          process.exit(1);
        }
        
        this.updatePackageVersion(appName, newVersion);
        console.log(`${appName} version updated to ${newVersion}`);
        break;
      }
      
      case 'generate-rc': {
        const appName = args[0];
        
        if (!appName || !this.apps.includes(appName)) {
          console.error('App name required:', this.apps.join(', '));
          process.exit(1);
        }
        
        const currentVersion = this.getCurrentVersion(appName);
        const rcVersion = this.generateRCVersion(currentVersion);
        console.log(rcVersion);
        break;
      }
      
      case 'remove-rc': {
        const appName = args[0];
        
        if (!appName || !this.apps.includes(appName)) {
          console.error('App name required:', this.apps.join(', '));
          process.exit(1);
        }
        
        const currentVersion = this.getCurrentVersion(appName);
        const cleanVersion = this.removeRCSuffix(currentVersion);
        console.log(cleanVersion);
        break;
      }

      case 'all-versions': {
        const result = {};
        this.apps.forEach(app => {
          result[app] = {
            current: this.getCurrentVersion(app),
            latestTag: this.getLatestTag(app),
            dockerVersion: this.generateDockerVersion(app, args[0] || 'main')
          };
        });
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      
      default:
        console.log('Comandos disponíveis:');
        console.log('  get-version <app-name>');
        console.log('  bump-version <app-name> [patch|minor|major]');
        console.log('  set-version <app-name> <version>');
        console.log('  create-tag <app-name> <version>');
        console.log('  create-tag-safe <app-name> <version>  # Com fallback automático para tags duplicadas');
        console.log('  get-latest-tag <app-name>');
        console.log('  docker-version <app-name> [branch]');
        console.log('  generate-rc <app-name>');
        console.log('  remove-rc <app-name>');
        console.log('  all-versions [branch]');
        console.log('');
        console.log('Apps disponíveis:', this.apps.join(', '));
        console.log('');
        console.log('💡 Para uso no pipeline Jenkins, recomenda-se usar create-tag-safe');
        console.log('   que automaticamente incrementa a versão se a tag já existir.');
        process.exit(1);
    }
  }
}

if (require.main === module) {
  const versionManager = new VersionManager();
  versionManager.processCommand();
}

module.exports = VersionManager;