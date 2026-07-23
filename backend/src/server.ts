import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase } from './config/database';

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start Express server
    const port = parseInt(env.PORT, 10);
    app.listen(port, () => {
      logger.info({ port, env: env.NODE_ENV }, `Server is running on port ${port}`);
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.fatal({ reason }, 'Unhandled Rejection');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.fatal({ error }, 'Uncaught Exception');
  process.exit(1);
});

startServer();
