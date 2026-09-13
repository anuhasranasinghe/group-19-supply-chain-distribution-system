// ============================================================
// Environment Configuration
// ============================================================
// Loads and validates environment variables from .env file.
// We centralize this so every part of the application gets its
// configuration from one trusted source, and missing variables
// are caught at startup rather than causing cryptic errors later.
// ============================================================

import dotenv from 'dotenv';

// Load .env file into process.env. In Docker, environment
// variables are set directly by docker-compose.yml, but dotenv
// doesn't overwrite existing variables, so this is safe.
dotenv.config();

// We validate required variables at startup. If any are missing,
// the server refuses to start — better to fail loudly here than
// to crash on the first database query or auth attempt.
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Check your .env file or docker-compose.yml configuration.`
    );
  }
  return value;
}

export const config = {
  // Node environment (development, production, test)
  nodeEnv: process.env.NODE_ENV || 'development',

  // Server port
  port: parseInt(process.env.BACKEND_PORT || '3000', 10),

  // PostgreSQL connection details.
  // IMPORTANT: In Docker, POSTGRES_HOST must be the service name
  // ("postgres"), not "localhost". Inside the Docker network,
  // containers resolve each other by service name.
  db: {
    host: requireEnv('POSTGRES_HOST'),
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: requireEnv('POSTGRES_DB'),
    user: requireEnv('POSTGRES_USER'),
    password: requireEnv('POSTGRES_PASSWORD'),
  },

  // JWT configuration for authentication tokens
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // CORS — the frontend origin allowed to make requests.
  // This must match exactly (protocol + host + port).
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
} as const;
