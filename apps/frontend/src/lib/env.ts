export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
} as const

// Validate required environment variables
const requiredEnvVars = ['VITE_API_URL'] as const

if (env.PROD) {
  for (const envVar of requiredEnvVars) {
    if (!import.meta.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`)
    }
  }
}