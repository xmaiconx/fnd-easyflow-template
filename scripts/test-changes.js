#!/usr/bin/env node

/**
 * Script para testar a detecção de mudanças com diferentes cenários
 * Uso: node scripts/test-changes.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Importar módulos dos scripts
const detectChanges = require('./detect-changes.js');
const VersionManager = require('./version-manager.js');

class TestRunner {
  constructor() {
    this.versionManager = new VersionManager();
    this.testResults = [];
  }

  log(message) {
    console.log(`[TEST] ${message}`);
  }

  error(message) {
    console.error(`[ERROR] ${message}`);
  }

  success(message) {
    console.log(`[SUCCESS] ${message}`);
  }

  /**
   * Simular mudanças em arquivos
   */
  simulateChanges(files) {
    return files.map(file => {
      if (file.startsWith('packages/')) {
        return file;
      } else if (file.startsWith('apps/')) {
        return file;
      }
      return file;
    });
  }

  /**
   * Testar detecção de mudanças em packages
   */
  testPackageChanges() {
    this.log('Testando detecção de mudanças em packages...');

    const testCases = [
      {
        name: 'Mudança em app-shared package',
        files: ['libs/app-shared/src/entities/Account.ts'],
        expectedApps: ['backend', 'frontend']
      },
      {
        name: 'Mudança em app-database package',
        files: ['libs/app-database/src/repositories/AccountRepository.ts'],
        expectedApps: ['backend']
      },
      {
        name: 'Mudança em app-infra package',
        files: ['libs/app-infra/src/services/ILoggerService.ts'],
        expectedApps: ['backend']
      }
    ];

    testCases.forEach(testCase => {
      this.log(`  Testando: ${testCase.name}`);
      
      const changedPackages = detectChanges.getChangedPackages(testCase.files);
      const affectedPackages = detectChanges.getAffectedPackages(changedPackages);
      const affectedApps = detectChanges.getAffectedApps([], affectedPackages);
      
      this.log(`    Packages alterados: ${changedPackages.join(', ')}`);
      this.log(`    Packages afetados: ${affectedPackages.join(', ')}`);
      this.log(`    Apps afetados: ${affectedApps.join(', ')}`);
      
      const success = testCase.expectedApps.every(app => affectedApps.includes(app));
      
      if (success) {
        this.success(`    ✓ Teste passou`);
      } else {
        this.error(`    ✗ Teste falhou - Esperado: ${testCase.expectedApps.join(', ')}, Obtido: ${affectedApps.join(', ')}`);
      }
      
      this.testResults.push({
        name: testCase.name,
        success,
        expected: testCase.expectedApps,
        actual: affectedApps
      });
    });
  }

  /**
   * Testar detecção de mudanças em apps
   */
  testAppChanges() {
    this.log('Testando detecção de mudanças em apps...');

    const testCases = [
      {
        name: 'Mudança apenas em backend',
        files: ['apps/backend/src/api/controllers/AccountController.ts'],
        expectedApps: ['backend']
      },
      {
        name: 'Mudança apenas em frontend',
        files: ['apps/frontend/src/pages/Login.tsx'],
        expectedApps: ['frontend']
      },
      {
        name: 'Mudança em múltiplos apps',
        files: [
          'apps/backend/src/api/controllers/AuthController.ts',
          'apps/frontend/src/components/auth/LoginForm.tsx'
        ],
        expectedApps: ['backend', 'frontend']
      }
    ];

    testCases.forEach(testCase => {
      this.log(`  Testando: ${testCase.name}`);
      
      const changedApps = detectChanges.getChangedApps(testCase.files);
      const affectedApps = detectChanges.getAffectedApps(changedApps, []);
      
      this.log(`    Apps alterados: ${changedApps.join(', ')}`);
      this.log(`    Apps afetados: ${affectedApps.join(', ')}`);
      
      const success = testCase.expectedApps.every(app => affectedApps.includes(app)) &&
                     affectedApps.every(app => testCase.expectedApps.includes(app));
      
      if (success) {
        this.success(`    ✓ Teste passou`);
      } else {
        this.error(`    ✗ Teste falhou - Esperado: ${testCase.expectedApps.join(', ')}, Obtido: ${affectedApps.join(', ')}`);
      }
      
      this.testResults.push({
        name: testCase.name,
        success,
        expected: testCase.expectedApps,
        actual: affectedApps
      });
    });
  }

  /**
   * Testar versionamento
   */
  testVersioning() {
    this.log('Testando sistema de versionamento...');
    
    const testCases = [
      {
        name: 'Bump patch version',
        currentVersion: '1.0.0',
        bumpType: 'patch',
        expected: '1.0.1'
      },
      {
        name: 'Bump minor version',
        currentVersion: '1.0.5',
        bumpType: 'minor',
        expected: '1.1.0'
      },
      {
        name: 'Bump major version',
        currentVersion: '2.3.4',
        bumpType: 'major',
        expected: '3.0.0'
      }
    ];

    testCases.forEach(testCase => {
      this.log(`  Testando: ${testCase.name}`);
      
      const result = this.versionManager.bumpVersion(testCase.currentVersion, testCase.bumpType);
      
      if (result === testCase.expected) {
        this.success(`    ✓ ${testCase.currentVersion} → ${result}`);
      } else {
        this.error(`    ✗ Esperado: ${testCase.expected}, Obtido: ${result}`);
      }
      
      this.testResults.push({
        name: testCase.name,
        success: result === testCase.expected,
        expected: testCase.expected,
        actual: result
      });
    });
  }

  /**
   * Testar cenários complexos
   */
  testComplexScenarios() {
    this.log('Testando cenários complexos...');

    const testCases = [
      {
        name: 'Mudança em app-shared afeta todos os apps',
        files: ['libs/app-shared/src/entities/User.ts'],
        expectedBuilds: {
          'backend': true,
          'frontend': true
        }
      },
      {
        name: 'Mudança em app-database afeta apenas backend',
        files: ['libs/app-database/src/repositories/UserRepository.ts'],
        expectedBuilds: {
          'backend': true,
          'frontend': false
        }
      },
      {
        name: 'Mudança apenas em documentação não afeta builds',
        files: ['README.md', 'CLAUDE.md'],
        expectedBuilds: {
          'backend': false,
          'frontend': false
        }
      }
    ];

    testCases.forEach(testCase => {
      this.log(`  Testando: ${testCase.name}`);

      const changedPackages = detectChanges.getChangedPackages(testCase.files);
      const changedApps = detectChanges.getChangedApps(testCase.files);
      const affectedPackages = detectChanges.getAffectedPackages(changedPackages);
      const affectedApps = detectChanges.getAffectedApps(changedApps, affectedPackages);

      const actualBuilds = {
        'backend': detectChanges.shouldBuildApp('backend', affectedApps),
        'frontend': detectChanges.shouldBuildApp('frontend', affectedApps)
      };
      
      this.log(`    Builds esperados: ${JSON.stringify(testCase.expectedBuilds)}`);
      this.log(`    Builds obtidos: ${JSON.stringify(actualBuilds)}`);
      
      const success = Object.keys(testCase.expectedBuilds).every(
        app => actualBuilds[app] === testCase.expectedBuilds[app]
      );
      
      if (success) {
        this.success(`    ✓ Teste passou`);
      } else {
        this.error(`    ✗ Teste falhou`);
      }
      
      this.testResults.push({
        name: testCase.name,
        success,
        expected: testCase.expectedBuilds,
        actual: actualBuilds
      });
    });
  }

  /**
   * Executar todos os testes
   */
  runAllTests() {
    this.log('Iniciando testes do sistema de detecção de mudanças...\n');
    
    this.testPackageChanges();
    console.log('');
    
    this.testAppChanges();
    console.log('');
    
    this.testVersioning();
    console.log('');
    
    this.testComplexScenarios();
    console.log('');
    
    this.printSummary();
  }

  /**
   * Imprimir resumo dos testes
   */
  printSummary() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(test => test.success).length;
    const failedTests = totalTests - passedTests;
    
    this.log('=== RESUMO DOS TESTES ===');
    this.log(`Total de testes: ${totalTests}`);
    this.success(`Testes aprovados: ${passedTests}`);
    
    if (failedTests > 0) {
      this.error(`Testes falharam: ${failedTests}`);
      
      this.log('\nTestes que falharam:');
      this.testResults
        .filter(test => !test.success)
        .forEach(test => {
          this.error(`  - ${test.name}`);
        });
    }
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    this.log(`Taxa de sucesso: ${successRate}%`);
    
    if (failedTests === 0) {
      this.success('\n🎉 Todos os testes passaram!');
      process.exit(0);
    } else {
      this.error('\n❌ Alguns testes falharam!');
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const testRunner = new TestRunner();
  testRunner.runAllTests();
}

module.exports = TestRunner;