/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Strict Environment Configuration Validator (Zod)
 * Validates process.env on boot. Crashes immediately with formatted output if invalid.
 */

import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  // ── Server ────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // ── Database ──────────────────────────────────────────────────────────────
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required (e.g. postgresql://user:pass@localhost:5432/portfolio)'),

  // ── Auth.js ───────────────────────────────────────────────────────────────
  // AUTH_SECRET: Signs session tokens. Generate with:
  //   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  // AUTH_URL: Base URL of the API server (not Vite). Used for OAuth callbacks.
  AUTH_URL: z.string().url().default('http://localhost:3001'),

  // ── Google OAuth ─────────────────────────────────────────────────────────
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required (Google Cloud Console)'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),

  // ── Admin Access ──────────────────────────────────────────────────────────
  // The only email allowed to sign in. Any other Google account is rejected.
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email address'),

  // ── Email (Phase 4.3) ─────────────────────────────────────────────────────
  RESEND_API_KEY: z.string().optional(),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('\n==================================================');
  console.error('❌ CRITICAL: INVALID ENVIRONMENT CONFIGURATION');
  console.error('--------------------------------------------------');
  parseResult.error.issues.forEach((issue) => {
    console.error(`  [${issue.path.join('.')}] ${issue.message}`);
  });
  console.error('==================================================\n');
  console.error('Copy .env.example → .env and fill in the required values.\n');
  process.exit(1);
}

export const env = parseResult.data;
