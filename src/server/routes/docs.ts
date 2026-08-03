/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * OpenAPI / Swagger UI Documentation Route
 * Mounts interactive Swagger UI documentation at /docs.
 */

import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../swagger.json';

export const docsRouter = Router();

docsRouter.use('/', swaggerUi.serve);
docsRouter.get('/', swaggerUi.setup(swaggerSpec));

export default docsRouter;
