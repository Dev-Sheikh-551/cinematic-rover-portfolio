/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Backend Platform Server Entrypoint
 * Boots Express server, validates environment, logs system ready banner, and handles graceful shutdown.
 */

import { env } from './config/env.js';
import { logger } from './logger.js';
import { createApp } from './app.js';
import { prisma } from '../lib/prisma/db.js';

async function bootstrap() {
  try {
    const app = createApp();

    // Verify Database Connection on boot
    await prisma.$connect();
    logger.info('✅ PostgreSQL Database connected successfully via Prisma ORM');

    const server = app.listen(env.PORT, () => {
      logger.info(`==================================================`);
      logger.info(`🚀 PORTFOLIO PLATFORM BACKEND SERVER RUNNING`);
      logger.info(`--------------------------------------------------`);
      logger.info(`  Environment:   ${env.NODE_ENV}`);
      logger.info(`  API Base URL:  http://localhost:${env.PORT}/api/v1`);
      logger.info(`  Health Check:  http://localhost:${env.PORT}/api/v1/health`);
      logger.info(`  Swagger Docs:  http://localhost:${env.PORT}/docs`);
      logger.info(`==================================================`);
    });

    // Graceful Shutdown Handler
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Initiating graceful shutdown...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await prisma.$disconnect();
        logger.info('Prisma database client disconnected.');
        process.exit(0);
      });

      // Force exit after 10s if shutdown hangs
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.fatal({ err: error }, '❌ Boot failure');
    process.exit(1);
  }
}

bootstrap();
