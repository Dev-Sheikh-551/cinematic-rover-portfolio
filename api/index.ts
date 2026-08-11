/**
 * Vercel Serverless Entry Point
 *
 * Wraps the full Express application as a single Vercel serverless function.
 * All /api/* requests are routed here by vercel.json.
 *
 * IMPORTANT: This file must NOT call app.listen() — Vercel's Node.js runtime
 * bridges the VercelRequest/VercelResponse directly to Express's handler.
 * The traditional HTTP server is only started by src/server/server.ts (local dev).
 */

console.log('[Vercel] Function module loading...');
console.log('[Vercel] Environment:', process.env.NODE_ENV ?? 'undefined');
console.log('[Vercel] DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('[Vercel] AUTH_SECRET exists:', !!process.env.AUTH_SECRET);
console.log('[Vercel] GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('[Vercel] ADMIN_EMAIL exists:', !!process.env.ADMIN_EMAIL);

import { createApp } from '../src/server/app';
import { prisma } from '../src/lib/prisma/db';
import { Router, type Request, type Response } from 'express';

console.log('[Vercel] createApp imported');

const app = createApp();

console.log('[Vercel] Express app created');

// ── Diagnostic db-test endpoint ───────────────────────────────────────────────
// Verifies Prisma → Supabase connectivity independently of any feature route.
// Remove this once production connectivity is confirmed.
const diagnosticRouter = Router();

diagnosticRouter.get('/db-test', async (_req: Request, res: Response) => {
  console.log('[Vercel] /db-test entered');
  try {
    await prisma.$queryRaw`SELECT 1 as ok`;
    console.log('[Vercel] /db-test SELECT 1 succeeded');
    res.status(200).json({ success: true, database: 'connected' });
  } catch (err: any) {
    console.error('[Vercel] /db-test SELECT 1 FAILED:', err?.message, err?.stack);
    res.status(500).json({
      success: false,
      database: 'error',
      // Only expose error class/message — never the connection string
      error: err?.message ?? 'Unknown error',
      code: err?.code ?? null,
    });
  }
});

// Mount diagnostic router on /api/v1 (before the 404 catch-all in app.ts)
// We reach into the app's router stack to prepend the diagnostic route.
app.use('/api/v1', diagnosticRouter);

console.log('[Vercel] Function initialized and ready');

export default app;
