#!/usr/bin/env node
/**
 * ===========================================
 * Start Test Infrastructure
 * ===========================================
 *
 * Levanta APENAS a infraestrutura de teste:
 * - Docker (PostgreSQL + Redis)
 * - Migrations
 * - Seed (super admin + conta de teste)
 *
 * NÃO levanta o backend - isso fica a cargo do agente
 *
 * Usage: node .claude/scripts/start-test-infra.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ===========================================
// Configuration
// ===========================================
const CONFIG = {
  composeFile: path.join(__dirname, '..', '..', 'infra', 'docker-compose.test.yml'),
  projectName: 'fnd-test',
  databaseUrl: 'postgresql://fnd_test:fnd_test_pass@localhost:5433/fnd_easyflow_test',
  redisUrl: 'redis://localhost:6380',
  superAdminEmail: 'admin@fnd.dev',
  superAdminPassword: 'SuperAdmin123!',
  containerTimeout: 60000,
  migrationsDir: path.join(__dirname, '..', '..', 'libs', 'app-database'),
};

const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[OK]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  step: (n, msg) => console.log(`\n\x1b[35m[${n}/4]\x1b[0m ${msg}`),
};

function exec(cmd, options = {}) {
  try {
    return execSync(cmd, {
      encoding: 'utf8',
      stdio: 'pipe',
      ...options,
    });
  } catch (error) {
    throw error;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(checkFn, timeout, name) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      if (await checkFn()) {
        return true;
      }
    } catch {
      // Ignore
    }
    await sleep(1000);
  }
  throw new Error(`${name} did not become healthy within ${timeout / 1000}s`);
}

// ===========================================
// Main
// ===========================================
(async () => {
  console.log('\n===========================================');
  console.log('  Test Infrastructure Starter');
  console.log('===========================================\n');

  try {
    // 1. Stop existing containers
    log.step(1, 'Cleaning up existing containers...');
    try {
      exec(`docker-compose -p ${CONFIG.projectName} -f "${CONFIG.composeFile}" down -v --remove-orphans`);
    } catch {
      // OK if nothing to stop
    }

    // Start containers
    exec(`docker-compose -p ${CONFIG.projectName} -f "${CONFIG.composeFile}" up -d`);
    log.success('Containers started');

    // 2. Wait for PostgreSQL
    log.step(2, 'Waiting for PostgreSQL...');
    await waitForHealth(
      () => {
        try {
          exec('docker exec fnd-postgres-test pg_isready -U fnd_test -d fnd_easyflow_test');
          return true;
        } catch {
          return false;
        }
      },
      CONFIG.containerTimeout,
      'PostgreSQL'
    );
    log.success('PostgreSQL ready');

    // 3. Run migrations
    log.step(3, 'Running migrations...');
    exec('npx knex migrate:latest', {
      cwd: CONFIG.migrationsDir,
      env: { ...process.env, DATABASE_URL: CONFIG.databaseUrl },
    });
    log.success('Migrations complete');

    // 4. Seed super admin
    log.step(4, 'Seeding super admin...');
    const bcrypt = require('bcryptjs');
    const passwordHash = bcrypt.hashSync(CONFIG.superAdminPassword, 10);

    const seedSql = `
      -- Create test account
      INSERT INTO accounts (id, name, status, created_at, updated_at)
      VALUES (
        '00000000-0000-0000-0000-000000000001',
        'Test Account',
        'active',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO NOTHING;

      -- Create super admin user
      INSERT INTO users (id, email, full_name, password_hash, role, status, email_verified, account_id, created_at, updated_at)
      VALUES (
        '00000000-0000-0000-0000-000000000002',
        '${CONFIG.superAdminEmail}',
        'Super Admin',
        '${passwordHash}',
        'super-admin',
        'active',
        true,
        '00000000-0000-0000-0000-000000000001',
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = 'super-admin',
        status = 'active',
        email_verified = true;
    `;

    const tempSqlFile = path.join(__dirname, 'temp-seed.sql');

    try {
      fs.writeFileSync(tempSqlFile, seedSql, 'utf8');
      exec(`docker cp "${tempSqlFile}" fnd-postgres-test:/tmp/seed.sql`);
      exec('docker exec fnd-postgres-test psql -U fnd_test -d fnd_easyflow_test -f /tmp/seed.sql');
      log.success(`Super admin created: ${CONFIG.superAdminEmail}`);
    } finally {
      try {
        fs.unlinkSync(tempSqlFile);
      } catch {}
    }

    console.log('\n===========================================');
    console.log('  Infrastructure Ready!');
    console.log('===========================================\n');
    console.log('PostgreSQL: localhost:5433');
    console.log('Redis: localhost:6380');
    console.log('Database: fnd_easyflow_test');
    console.log('Super Admin: admin@fnd.dev / SuperAdmin123!\n');
    console.log('Next steps:');
    console.log('1. Start backend with test env:');
    console.log('   Windows: set NODE_ENV=test && set DATABASE_URL=postgresql://fnd_test:fnd_test_pass@localhost:5433/fnd_easyflow_test && set REDIS_URL=redis://localhost:6380 && set API_PORT=3099 && set JWT_SECRET=test-jwt-secret && set SUPER_ADMIN_EMAIL=admin@fnd.dev && npm run dev:backend');
    console.log('   Linux/Mac: NODE_ENV=test DATABASE_URL=postgresql://fnd_test:fnd_test_pass@localhost:5433/fnd_easyflow_test REDIS_URL=redis://localhost:6380 API_PORT=3099 JWT_SECRET=test-jwt-secret SUPER_ADMIN_EMAIL=admin@fnd.dev npm run dev:backend');
    console.log('2. Run tests: node .claude/scripts/run-single-hurl.js <feature-id> <test-file>');
    console.log('3. Stop infra: node .claude/scripts/stop-test-infra.js\n');
    console.log('IMPORTANT: NODE_ENV=test disables rate limiting for tests.\n');

  } catch (error) {
    log.error(`Failed: ${error.message}`);
    if (error.stderr) {
      console.error(error.stderr);
    }
    process.exit(1);
  }
})();
