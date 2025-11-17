#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Classe para automatizar a criação de releases baseado em package.json.
 * Adaptado para Gestão Consultório (GC)
 * Backend: Jenkins (Docker + Nexus)
 * Frontend: Cloudflare Pages (deploy automático via Git)
 */
class ReleaseManager {
  constructor() {
    this.apps = ['backend', 'frontend'];  // Versionamento para ambos, mas apenas backend vai pro Jenkins
    this.packageDependencies = this.buildPackageDependencyMap();
  }

  /**
   * Constrói mapa de dependências entre packages e apps.
   * @returns {Object} - Mapa de quais apps dependem de quais packages
   */
  buildPackageDependencyMap() {
    const dependencyMap = {};
    
    this.apps.forEach(app => {
      const packagePath = path.join('apps', app, 'package.json');
      if (fs.existsSync(packagePath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
          const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
          
          dependencyMap[app] = Object.keys(dependencies)
            .filter(dep => dep.startsWith('@gc/'))
            .map(dep => dep.replace('@gc/', ''));
        } catch (error) {
          console.warn(`⚠️ Erro ao ler package.json de ${app}: ${error.message}`);
          dependencyMap[app] = [];
        }
      } else {
        dependencyMap[app] = [];
      }
    });
    
    return dependencyMap;
  }

  /**
   * Executa um comando no shell e exibe sua saída.
   * @param {string} command - O comando a ser executado.
   */
  exec(command) {
    try {
      console.log(`$ ${command}`);
      // stdio: 'inherit' faz com que o output do comando filho seja exibido no processo pai
      execSync(command, { stdio: 'inherit', encoding: 'utf8' });
    } catch (error) {
      console.error(`\nErro ao executar o comando: ${command}`);
      process.exit(1);
    }
  }

  /**
   * Atualiza a versão no package.json de uma aplicação.
   * @param {string} appName - Nome da aplicação
   * @param {string} newVersion - Nova versão
   */
  updatePackageVersion(appName, newVersion) {
    const packagePath = path.join('apps', appName, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const oldVersion = packageJson.version;
      packageJson.version = newVersion;
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`✅ ${appName}: ${oldVersion} → ${newVersion}`);
    } else {
      console.error(`❌ Package.json não encontrado: ${packagePath}`);
      process.exit(1);
    }
  }

  /**
   * Executa comando Git e retorna output silenciosamente.
   * @param {string} command - Comando Git
   * @returns {string} - Output do comando
   */
  execGit(command) {
    try {
      return execSync(command, { encoding: 'utf8' }).trim();
    } catch (error) {
      return '';
    }
  }

  /**
   * Obtém a versão atual de uma aplicação do package.json.
   * @param {string} appName - Nome da aplicação
   * @returns {string} - Versão atual
   */
  getCurrentVersion(appName) {
    const packagePath = path.join('apps', appName, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      return packageJson.version;
    }
    return '0.1.0';
  }

  /**
   * Detecta quais packages foram alterados.
   * @param {string} changedFiles - String com arquivos alterados separados por \n
   * @returns {string[]} - Lista de packages que mudaram
   */
  detectChangedPackages(changedFiles) {
    const changedPackages = [];
    const packageFolders = this.getPackageFolders();
    
    packageFolders.forEach(packageName => {
      const packagePath = `libs/${packageName}/`;
      if (changedFiles.includes(packagePath) || changedFiles.split('\n').some(file => file.startsWith(packagePath))) {
        changedPackages.push(packageName);
      }
    });
    
    return changedPackages;
  }

  /**
   * Obtém lista de packages do monorepo.
   * @returns {string[]} - Lista de nomes dos packages
   */
  getPackageFolders() {
    try {
      const libsDir = path.join('libs');
      if (fs.existsSync(libsDir)) {
        return fs.readdirSync(libsDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);
      }
      return [];
    } catch (error) {
      console.warn(`⚠️ Erro ao ler diretório libs: ${error.message}`);
      return [];
    }
  }

  /**
   * Determina quais apps precisam ser rebuilt baseado em mudanças de packages.
   * @param {string[]} changedPackages - Lista de packages alterados
   * @returns {string[]} - Lista de apps que precisam ser rebuilt
   */
  getAppsAffectedByPackageChanges(changedPackages) {
    const affectedApps = [];
    
    this.apps.forEach(app => {
      const appDependencies = this.packageDependencies[app] || [];
      const hasAffectedDependency = changedPackages.some(pkg => appDependencies.includes(pkg));
      
      if (hasAffectedDependency) {
        affectedApps.push(app);
      }
    });
    
    return affectedApps;
  }

  /**
   * Detecta quais aplicações tiveram mudanças desde o último commit [release] ou [production].
   * @param {string} environment - 'release' ou 'production'
   * @returns {string[]} - Lista de apps que mudaram
   */
  detectChangedApps(environment = 'release') {
    try {
      // Buscar último commit baseado no ambiente
      const searchPattern = environment === 'production' ? '\\[production\\]' : '\\[release\\]';
      const lastReleaseCommit = this.execGit(`git log --oneline --grep="${searchPattern}" -1 --format="%H"`);
      
      let baseCommit = 'HEAD~10'; // fallback
      if (lastReleaseCommit) {
        baseCommit = lastReleaseCommit;
        console.log(`📍 Último release encontrado: ${lastReleaseCommit.substring(0, 8)}`);
      } else {
        console.log(`📍 Nenhum release anterior encontrado, usando ${baseCommit}`);
      }

      // Obter arquivos alterados
      const changedFiles = this.execGit(`git diff --name-only ${baseCommit} HEAD`);
      
      if (!changedFiles) {
        console.log('⚠️  Nenhuma mudança detectada');
        return [];
      }

      console.log(`📝 Arquivos alterados desde último release:`);
      changedFiles.split('\n').forEach(file => console.log(`   - ${file}`));

      // Detectar quais apps tiveram mudanças diretas
      const directlyChangedApps = [];
      this.apps.forEach(app => {
        const appPath = `apps/${app}/`;
        if (changedFiles.includes(appPath) || changedFiles.split('\n').some(file => file.startsWith(appPath))) {
          directlyChangedApps.push(app);
        }
      });

      // Detectar quais packages foram alterados
      const changedPackages = this.detectChangedPackages(changedFiles);
      
      // Detectar quais apps são afetados por mudanças em packages
      const appsAffectedByPackages = this.getAppsAffectedByPackageChanges(changedPackages);

      // Combinar apps diretamente alterados com apps afetados por packages
      const allChangedApps = [...new Set([...directlyChangedApps, ...appsAffectedByPackages])];

      // Log detalhado sobre as mudanças
      if (directlyChangedApps.length > 0) {
        console.log(`📦 Apps com mudanças diretas: ${directlyChangedApps.join(', ')}`);
      }
      
      if (changedPackages.length > 0) {
        console.log(`📚 Packages alterados: ${changedPackages.join(', ')}`);
        if (appsAffectedByPackages.length > 0) {
          console.log(`🔗 Apps afetados por mudanças em packages: ${appsAffectedByPackages.join(', ')}`);
        }
      }

      return allChangedApps;
    } catch (error) {
      console.error('Erro ao detectar mudanças:', error.message);
      return this.apps; // fallback: todos os apps
    }
  }

  /**
   * Incrementa uma string de versão semântica.
   * @param {string} currentVersion - A versão atual.
   * @param {'patch'|'minor'|'major'} type - O tipo de incremento.
   * @returns {string} - A nova versão.
   */
  bumpVersion(currentVersion, type = 'patch') {
    let [major, minor, patch] = currentVersion.split('.').map(Number);
    switch (type) {
      case 'major':
        major++;
        minor = 0;
        patch = 0;
        break;
      case 'minor':
        minor++;
        patch = 0;
        break;
      case 'patch':
      default:
        patch++;
        break;
    }
    return `${major}.${minor}.${patch}`;
  }

  /**
   * Orquestra o processo de criação de release.
   */
  run() {
    const args = process.argv.slice(2);
    const forceFlag = args.includes('--force');
    
    // Remover --force dos argumentos para processar os outros parâmetros
    const filteredArgs = args.filter(arg => arg !== '--force');
    
    const environment = filteredArgs[0] || 'release';  // 'release' ou 'production'
    const bumpType = filteredArgs[1] || 'patch';
    
    if (!['release', 'production'].includes(environment)) {
      console.error('Ambiente inválido. Use "release" ou "production".');
      console.log('Exemplo: node scripts/create-release.js release patch');
      console.log('Exemplo: node scripts/create-release.js production minor');
      console.log('Exemplo: node scripts/create-release.js release patch --force');
      process.exit(1);
    }
    
    if (!['patch', 'minor', 'major'].includes(bumpType)) {
      console.error('Tipo de release inválido. Use "patch", "minor" ou "major".');
      console.log('Exemplo: node scripts/create-release.js release minor');
      console.log('Exemplo: node scripts/create-release.js release minor --force');
      process.exit(1);
    }

    console.log(`🚀 Iniciando processo de ${environment}...`);
    if (forceFlag) {
      console.log('🔥 Modo FORCE ativado - ignorando detecção de mudanças');
    }
    
    // Log das dependências detectadas
    console.log('\n🔍 Dependências entre packages e apps detectadas:');
    Object.entries(this.packageDependencies).forEach(([app, packages]) => {
      if (packages.length > 0) {
        console.log(`   ${app}: ${packages.join(', ')}`);
      } else {
        console.log(`   ${app}: sem dependências de packages`);
      }
    });
    
    console.log('\nBuscando as últimas atualizações do repositório...');
    this.exec('git fetch origin');

    // Salvar branch atual para retornar depois
    const currentBranch = this.execGit('git branch --show-current');
    console.log(`📍 Branch atual: ${currentBranch}`);

    // Determinar branch alvo baseado no environment
    const targetBranch = environment === 'production' ? 'production' : 'release';
    
    // Fazer checkout para a branch alvo
    console.log(`\n🔀 Fazendo checkout para branch ${targetBranch}...`);
    this.exec(`git checkout ${targetBranch} || git checkout -b ${targetBranch}`);
    this.exec(`git pull origin ${targetBranch} || echo "Branch nova ou sem commits remotos"`);

    // Se estivermos na production, fazer merge da main primeiro para ter as últimas mudanças
    if (environment === 'production') {
      console.log('\n🔄 Sincronizando production com main...');
      this.exec('git pull origin main || echo "Erro ao fazer pull da main - continuando"');
    }

    // Detectar quais apps mudaram
    let changedApps = this.detectChangedApps(environment);
    
    if (changedApps.length === 0 && !forceFlag) {
      console.log('⚠️  Nenhuma aplicação teve mudanças. Nada para fazer.');
      console.log('💡 Use --force para forçar a criação de release mesmo sem mudanças:');
      console.log(`   node scripts/create-release.js ${environment} ${bumpType} --force`);
      process.exit(0);
    }
    
    // Se --force foi usado e não há mudanças, processar todos os apps
    if (forceFlag && changedApps.length === 0) {
      console.log('🔥 Forçando release de todas as aplicações...');
      changedApps = this.apps;
    }

    console.log(`\n🎯 Aplicações que serão atualizadas: ${changedApps.join(', ')}`);

    const updatedApps = [];
    
    // Atualizar versão apenas dos apps que mudaram
    changedApps.forEach(app => {
      const currentVersion = this.getCurrentVersion(app);
      let newVersion;
      
      if (environment === 'release') {
        // Para release, gerar versão RC
        if (currentVersion.includes('-rc.')) {
          // Se já é RC, incrementar RC
          const rcMatch = currentVersion.match(/^(.+)-rc\.(\d+)$/);
          if (rcMatch) {
            const baseVersion = rcMatch[1];
            const rcNumber = parseInt(rcMatch[2]) + 1;
            newVersion = `${baseVersion}-rc.${rcNumber}`;
          } else {
            newVersion = `${currentVersion}-rc.1`;
          }
        } else {
          // Se não é RC, fazer bump e adicionar RC
          const bumpedVersion = this.bumpVersion(currentVersion, bumpType);
          newVersion = `${bumpedVersion}-rc.1`;
        }
      } else {
        // Para production, remover RC e usar versão limpa
        if (currentVersion.includes('-rc.')) {
          newVersion = currentVersion.replace(/-rc\.\d+$/, '');
        } else {
          newVersion = this.bumpVersion(currentVersion, bumpType);
        }
      }
      
      console.log(`\n📦 Atualizando ${app}:`);
      this.updatePackageVersion(app, newVersion);
      
      updatedApps.push({ app, version: newVersion });
    });

    // Criar mensagem de commit descritiva
    const releaseTag = environment === 'production' ? '[production]' : '[release]';
    const forceDockerTag = forceFlag ? ' [force docker]' : '';
    const releaseMessage = updatedApps.length === 1
      ? `${environment === 'production' ? 'Production' : 'Release'}: ${updatedApps[0].app} v${updatedApps[0].version} ${releaseTag}${forceDockerTag}`
      : `${environment === 'production' ? 'Production' : 'Release'}: ${updatedApps.map(u => `${u.app} v${u.version}`).join(', ')} ${releaseTag}${forceDockerTag}`;

    console.log(`\n📝 Criando commit com as mudanças de versão...`);
    this.exec('git add apps/*/package.json');
    this.exec(`git commit -m "${releaseMessage}"`);

    console.log(`\n📤 Fazendo push das mudanças na branch ${targetBranch}...`);
    this.exec(`git push origin ${targetBranch}`);

    // Retornar para a branch main e fazer merge das mudanças de versão
    console.log(`\n🔄 Retornando para branch main e sincronizando...`);
    this.exec('git checkout main');
    this.exec('git pull origin main');
    
    console.log(`\n🔀 Fazendo merge das mudanças de versão na main...`);
    this.exec(`git merge ${targetBranch} --no-ff -m "Sync version updates from ${targetBranch} [skip ci]"`);
    // this.exec('git push origin main');

    // Se havia uma branch original diferente de main, retornar para ela
    if (currentBranch && currentBranch !== 'main' && currentBranch !== targetBranch) {
      console.log(`\n↩️ Retornando para branch original: ${currentBranch}`);
      this.exec(`git checkout ${currentBranch}`);
    }

    console.log(`\n✅ ${environment === 'production' ? 'Production' : 'Release'} criado com sucesso!`);
    console.log(`\n📋 Aplicações atualizadas:`);
    updatedApps.forEach(u => console.log(`   - ${u.app}: v${u.version}`));
    
    console.log(`\n🔄 Próximos passos:`);
    if (environment === 'production') {
      console.log(`   1. O pipeline Jenkins irá automaticamente:`);
      console.log(`      - Detectar commit na branch production`);
      console.log(`      - Buildar e publicar imagens Docker finais`);
      console.log(`      - Marcar as imagens como 'latest'`);
      console.log(`   2. Verificar o build no Jenkins`);
      console.log(`   3. Validar as imagens no registry`);
      console.log(`   4. Deploy em produção`);
    } else {
      console.log(`   1. O pipeline Jenkins irá automaticamente:`);
      console.log(`      - Detectar commit na branch release`);
      console.log(`      - Buildar e publicar imagens Docker RC`);
      console.log(`      - Disponibilizar para testes de homologação`);
      console.log(`   2. Verificar o build no Jenkins`);
      console.log(`   3. Testar em ambiente de homologação`);
      console.log(`   4. Após validação, executar: node scripts/create-release.js production`);
    }
  }
}

const manager = new ReleaseManager();
manager.run();