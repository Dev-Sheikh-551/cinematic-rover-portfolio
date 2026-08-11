/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Strict Environment Configuration Validator (Zod)
 * Validates process.env on boot. On Vercel (serverless), throws instead of
 * process.exit(1) so that only the missing-config error propagates, not a
 * full process termination that kills every concurrent function invocation.
 */

import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env only in non-Vercel environments (Vercel injects env vars directly).
// We do NOT use path.resolve(process.cwd(), '.env') because process.cwd() is
// unpredictable inside Vercel's serverless sandbox — the lambda working directory
// is NOT the project root. This call is a no-op in production when .env doesn't
// exist, which is correct behaviour.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const envSchema = z.object({
  // ── Server ────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // ── Database ──────────────────────────────────────────────────────────────
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // ── Auth.js ───────────────────────────────────────────────────────────────
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  // AUTH_URL: Base URL of the application. Auth.js appends /api/auth internally.
  // Production: https://cinematic-rover-portfolio.vercel.app
  // Local dev:  http://localhost:3001
  AUTH_URL: z.string().url().default('http://localhost:3001'),

  // ── Google OAuth ─────────────────────────────────────────────────────────
  // Optional at the env-schema level so a missing value emits a warning rather
  // than killing the entire Vercel function via process.exit(1), which would
  // take down public routes (testimonials, contact) along with admin routes.
  GOOGLE_CLIENT_ID: z.string().min(1).optional().default('placeholder'),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional().default('placeholder'),

  // ── Admin Access ──────────────────────────────────────────────────────────
  ADMIN_EMAIL: z.string().email().optional().default('admin@example.com'),

  // ── Email ─────────────────────────────────────────────────────────────────
  RESEND_API_KEY: z.string().optional(),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  const formatted = parseResult.error.issues
    .map((i) => `  [${i.path.join('.')}] ${i.message}`)
    .join('\n');
  const message = `\n❌ INVALID ENVIRONMENT CONFIGURATION:\n${formatted}\n`;
  console.error(message);
  // On Vercel serverless, process.exit() kills the entire lambda container and
  // makes FUNCTION_INVOCATION_FAILED appear for ALL routes including public ones.
  // Throw instead so only this specific invocation fails with a useful 500 error.
  if (process.env.NODE_ENV === 'production') {
    throw new Error(message);
  } else {
    process.exit(1);
  }
}

export const env = parseResult.data;
