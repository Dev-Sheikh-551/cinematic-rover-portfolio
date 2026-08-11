/**
 * Vercel Serverless Entry Point
 *
 * Wraps the full Express application as a single Vercel serverless function.
 * All /api/* requests are routed here by vercel.json.
 * The Express app (middleware, routes, Prisma, Auth.js) runs unchanged.
 */

import { createApp } from '../src/server/app';

const app = createApp();

export default app;
