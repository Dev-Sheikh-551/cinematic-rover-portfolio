/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Express Application Pipeline Setup
 * Configures middleware, API v1 routes, Auth.js, Swagger documentation, and global error handling.
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { env } from './config/env';
import { logger } from './logger';
import { requestIdMiddleware } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { docsRouter } from './routes/docs';
import { contactRouter } from '../features/contact/contact.routes';
import { testimonialRouter } from '../features/testimonial/testimonial.routes';
import { authHandler } from './auth';
import { sendError } from './response';

export function createApp(): Express {
  const app = express();

  // Required for Auth.js to trust proxy headers (X-Forwarded-For etc.)
  app.set('trust proxy', true);

  // 1. Core Middleware
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true, // Required for session cookies to be sent cross-origin
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // 2. Request ID & Structured Pino HTTP Logger
  app.use(requestIdMiddleware);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as Request).id || 'unknown',
      customLogLevel: (_req, res, err) => {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    })
  );

  // 3. Auth.js — handles /api/auth/* (signin, callback, signout, session)
  app.use('/api/auth', authHandler);

  // 4. Documentation Endpoint
  app.use('/docs', docsRouter);

  // 5. API v1 Router Mounts
  const v1Router = express.Router();
  v1Router.use('/health', healthRouter);
  v1Router.use('/contact', contactRouter);
  v1Router.use('/testimonials', testimonialRouter);

  app.use('/api/v1', v1Router);

  // 6. 404 Catch-All Handler
  app.use((req: Request, res: Response) => {
    return sendError(
      res,
      `Route ${req.method} ${req.originalUrl} not found`,
      404,
      'NOT_FOUND'
    );
  });

  // 7. Global Error Handler (must be last)
  app.use(errorHandler);

  return app;
}

export default createApp;
