#!/usr/bin/env node
/**
 * ===========================================
 * Run Single Hurl Test
 * ===========================================
 *
 * Executa um único arquivo .hurl e salva o output em arquivo
 *
 * Usage:
 *   node .claude/scripts/run-single-hurl.js <feature-id> <test-file>
 *   node .claude/scripts/run-single-hurl.js F0001-internal-auth-admin-panel 01-auth-signup-signin.hurl
 *
 * Output:
 *   - Console: output completo do teste
 *   - Arquivo: docs/features/<feature-id>/tests/api/<test-file>-result.txt
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ===========================================
// Parse Arguments
// ===========================================
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node .claude/scripts/run-single-hurl.js <feature-id> <test-file>');
  console.error('Example: node .claude/scripts/run-single-hurl.js F0001-internal-auth-admin-panel 01-auth-signup-signin.hurl');
  process.exit(1);
}

const [featureId, testFile] = args;

// ===========================================
// Configuration
// ===========================================
const CONFIG = {
  apiBaseUrl: 'http://localhost:3099',
  testsDir: path.join(__dirname, '..', '..', 'docs', 'features', featureId, 'tests', 'api'),
  testFilePath: null,
  outputFilePath: null,
};

CONFIG.testFilePath = path.join(CONFIG.testsDir, testFile);
CONFIG.outputFilePath = path.join(CONFIG.testsDir, testFile.replace('.hurl', '-result.txt'));

// ===========================================
// Validation
// ===========================================
if (!fs.existsSync(CONFIG.testFilePath)) {
  console.error(`Test file not found: ${CONFIG.testFilePath}`);
  process.exit(1);
}

// ===========================================
// Variables
// ===========================================
const variables = [
  `API_URL=${CONFIG.apiBaseUrl}/api/v1`,
  'TEST_EMAIL=test@example.com',
  'TEST_PASSWORD=Password123!',
  'TEST_NAME=Test User',
  'TEST_WORKSPACE=Test Workspace',
  'SUPER_ADMIN_EMAIL=admin@fnd.dev',
  'SUPER_ADMIN_PASSWORD=SuperAdmin123!',
];

const variablesArgs = variables.map((v) => `--variable "${v}"`).join(' ');

// ===========================================
// Execute Test
// ===========================================
console.log('\n===========================================');
console.log(`  Running: ${testFile}`);
console.log('===========================================\n');

let output = '';
let exitCode = 0;

try {
  output = execSync(`npx hurl --test --verbose ${variablesArgs} "${CONFIG.testFilePath}"`, {
    encoding: 'utf8',
    cwd: CONFIG.testsDir,
    stdio: 'pipe',
  });
} catch (error) {
  exitCode = error.status || 1;
  output = error.stdout || error.message;

  // If there's stderr, append it
  if (error.stderr) {
    output += '\n\n=== STDERR ===\n' + error.stderr;
  }
}

// ===========================================
// Save Output
// ===========================================
fs.writeFileSync(CONFIG.outputFilePath, output, 'utf8');

// ===========================================
// Display Results
// ===========================================
console.log(output);

console.log('\n===========================================');
console.log(exitCode === 0 ? '  ✅ PASSED' : '  ❌ FAILED');
console.log('===========================================\n');
console.log(`Output saved to: ${CONFIG.outputFilePath}\n`);

process.exit(exitCode);
