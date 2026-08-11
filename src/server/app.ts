/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Express Application Pipeline Setup
 * Configures security headers, rate limiters, middleware, API v1 routes, Auth.js, and global error handling.
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './logger.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';
import {
  securityHeaders,
  globalApiLimiter,
  authLimiter,
  sanitizeInputMiddleware,
} from './middleware/security.js';
import { healthRouter } from './routes/health.js';
import { docsRouter } from './routes/docs.js';
import { contactRouter } from '../features/contact/contact.routes.js';
import { testimonialRouter } from '../features/testimonial/testimonial.routes.js';
import { analyticsRouter } from '../features/analytics/analytics.routes.js';
import { authHandler } from './auth.js';
import { sendError } from './response.js';

export function createApp(): Express {
  const app = express();

  // Disable powered-by header to prevent framework fingerprinting
  app.disable('x-powered-by');

  // Trust proxy headers for Cloud Run / Vercel / Nginx load balancers
  app.set("trust proxy", process.env.NODE_ENV === "production" ? 1 : false);

  // 1. Security Headers (Helmet)
  app.use(securityHeaders);

  // 2. CORS
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  // 3. Request ID & Pino Logging
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

  // 4. Auth.js Endpoints (Must be mounted before express.json / urlencoded to preserve raw request stream for Web API Request parsing)
  app.use('/api/auth', authLimiter, authHandler);

  // 4. Body Parsing & Input Sanitization
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));
  app.use(sanitizeInputMiddleware);

  // 6. OpenAPI Documentation Endpoint
  app.use('/docs', docsRouter);

  // 7. API v1 Router Mounts with Global API Rate Limiter
  const v1Router = express.Router();
  v1Router.use('/health', healthRouter);
  v1Router.use('/contact', contactRouter);
  v1Router.use('/testimonials', testimonialRouter);
  v1Router.use('/analytics', analyticsRouter);

  app.use('/api/v1', globalApiLimiter, v1Router);

  // 8. 404 Catch-All Handler
  app.use((req: Request, res: Response) => {
    return sendError(
      res,
      `Route ${req.method} ${req.originalUrl} not found`,
      404,
      'NOT_FOUND'
    );
  });

  // 9. Global Error Handler (must be last)
  app.use(errorHandler);

  return app;
}

export default createApp;
