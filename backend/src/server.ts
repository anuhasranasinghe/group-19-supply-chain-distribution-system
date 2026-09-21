// ============================================================
// Server Entry Point
// ============================================================
// This is the file that actually starts the HTTP server.
// It's separate from app.ts so the Express app can be imported independently for testing.
//
// Startup sequence:
// 1. Load environment configuration
// 2. Test database connection
// 3. Start HTTP server
// 4. Log success message with the server URL
// ============================================================

import app from './app.js';
import { config } from './config/environment.js';
import { testDatabaseConnection } from './database/connection.js';

async function startServer() {
  try {
    console.log('🚀 Starting SCDS Backend Server...');
    console.log(`📋 Environment: ${config.nodeEnv}`);

    // Step 1: Verify database connectivity before accepting requests.
    // If PostgreSQL is unreachable (wrong host, credentials, or
    // the Docker container isn't ready yet), we want to fail fast
    // with a clear error message rather than starting the server
    // and failing on the first API call.
    console.log('📦 Testing database connection...');
    await testDatabaseConnection();

    // Step 2: Start the HTTP server.
    app.listen(config.port, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════');
      console.log('  SCDS Backend Server is running!');
      console.log(`  Local:    http://localhost:${config.port}`);
      console.log(`  Health:   http://localhost:${config.port}/api/health`);
      console.log(`  Frontend: ${config.frontendUrl}`);
      console.log('═══════════════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', (error as Error).message);
    console.error('');
    console.error('Common causes:');
    console.error('  • PostgreSQL is not running');
    console.error('  • Wrong POSTGRES_HOST (use "postgres" in Docker, "localhost" locally)');
    console.error('  • Wrong POSTGRES_USER or POSTGRES_PASSWORD');
    console.error('  • Database has not been created yet');
    console.error('');
    process.exit(1);
  }
}

// Handle unexpected errors that escape the Express error handler
process.on('unhandledRejection', (reason: unknown) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

startServer();
