/**
 * Start Backend for Tests
 *
 * This script starts the backend with test environment variables
 */

const { spawn } = require('child_process');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');

// Set environment variables
process.env.NODE_ENV = 'test';
process.env.API_PORT = '3099';
process.env.DATABASE_URL = 'postgresql://fnd_test:fnd_test_pass@localhost:5433/fnd_easyflow_test';
process.env.REDIS_URL = 'redis://localhost:6380';
process.env.NODE_MODE = 'api';
process.env.SUPER_ADMIN_EMAIL = 'admin@fnd.dev';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.LOG_LEVEL = 'warn';
process.env.RESEND_API_KEY = 'test-key';
process.env.RESEND_FROM_EMAIL = 'test@fnd.dev';
process.env.FRONTEND_URL = 'http://localhost:3000';

console.log('Starting backend with test environment...');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('API_PORT:', process.env.API_PORT);
console.log('NODE_MODE:', process.env.NODE_MODE);

// Use require directly instead of spawn
require('../../apps/backend/src/local.ts');
