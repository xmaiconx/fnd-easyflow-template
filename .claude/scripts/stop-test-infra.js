#!/usr/bin/env node
/**
 * ===========================================
 * Stop Test Infrastructure
 * ===========================================
 *
 * Para e remove containers de teste
 *
 * Usage: node .claude/scripts/stop-test-infra.js
 */

const { execSync } = require('child_process');
const path = require('path');

const CONFIG = {
  composeFile: path.join(__dirname, '..', '..', 'infra', 'docker-compose.test.yml'),
  projectName: 'fnd-test',
};

const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[OK]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
};

console.log('\n===========================================');
console.log('  Stopping Test Infrastructure');
console.log('===========================================\n');

try {
  log.info('Stopping containers...');
  execSync(`docker-compose -p ${CONFIG.projectName} -f "${CONFIG.composeFile}" down -v --remove-orphans`, {
    stdio: 'inherit',
  });
  log.success('Infrastructure stopped and removed');
} catch (error) {
  log.error(`Failed: ${error.message}`);
  process.exit(1);
}

console.log('');
