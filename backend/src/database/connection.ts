// ============================================================
// Database Connection — pg Pool
// ============================================================
// We keep the database connection pool in one place so individual services do not repeatedly create new PostgreSQL connections. 
// A pool maintains a set of reusable connections, which is much more efficient than opening/closing a connection for every query.
//
// This is the ONLY place in the application that creates a pg.Pool instance. All services import `pool` from here.
//
// The pool automatically manages connection lifecycle:
// - When a service calls pool.query(), it borrows a connection
// - After the query completes, the connection returns to the pool
// - If all connections are busy, new queries wait in a queue
// ============================================================

import pg from 'pg';
import { config } from '../config/environment.js';

const { Pool } = pg;

// Create the connection pool using environment variables.
// In Docker, the host is the PostgreSQL service name ("postgres"),
// not "localhost". This is because Docker Compose creates a
// virtual network where services resolve each other by name.
export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,

  // Maximum number of connections in the pool.
  // For a development project, 20 is more than enough.
  max: 20,

  // How long a client can sit idle in the pool before being
  // closed and removed. 30 seconds is a reasonable default.
  idleTimeoutMillis: 30000,

  // How long to wait when trying to connect before timing out.
  connectionTimeoutMillis: 5000,
});

// Log when the pool successfully connects (helpful for debugging
// Docker networking issues where the backend can't reach PostgreSQL).
pool.on('connect', () => {
  console.log('📦 New client connected to PostgreSQL pool');
});

// Log pool errors. These can happen when PostgreSQL goes down
// or a connection is unexpectedly terminated.
pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL pool error:', err.message);
});

// A helper to test the database connection at startup.
// We call this from server.ts to verify the database is
// reachable before accepting HTTP requests.
export async function testDatabaseConnection(): Promise<void> {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL database');
    client.release();
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:', (error as Error).message);
    throw error;
  }
}
