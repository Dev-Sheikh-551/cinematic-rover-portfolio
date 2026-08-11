/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * OpenAPI / Swagger UI Documentation Route
 * Mounts interactive Swagger UI documentation at /docs in development.
 *
 * NOTE: swagger-ui-express reads static assets from disk using __dirname-relative
 * paths. In Vercel's serverless lambda sandbox those filesystem paths do not exist,
 * causing a FUNCTION_INVOCATION_FAILED crash at module init time.
 * The /docs route is therefore disabled in production — it is a development tool only.
 *
 * NOTE: Because package.json sets "type": "module", bare require() is unavailable.
 * We use createRequire(import.meta.url) to bridge ESM → CJS for swagger-ui-express.
 */

import { Router, Request, Response } from 'express';
import { createRequire } from 'module';

export const docsRouter = Router();

if (process.env.NODE_ENV !== 'production') {
  const require = createRequire(import.meta.url);
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const swaggerUi = require('swagger-ui-express');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const swaggerSpec = require('../swagger.json');

  docsRouter.use('/', swaggerUi.serve);
  docsRouter.get('/', swaggerUi.setup(swaggerSpec));
} else {
  docsRouter.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      message: 'API documentation is available in development mode only.',
      docs: 'Run locally with npm run dev:all and visit http://localhost:3001/docs',
    });
  });
}

export default docsRouter;
