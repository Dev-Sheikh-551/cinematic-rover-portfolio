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
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required (e.g. postgresql://user:pass@localhost:5432/portfolio)'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long').default('super-secret-portfolio-jwt-key-min-16-chars'),
  RESEND_API_KEY: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('\n==================================================');
  console.error('❌ CRITICAL: INVALID ENVIRONMENT CONFIGURATION');
  console.error('--------------------------------------------------');
  console.error(JSON.stringify(parseResult.error.format(), null, 2));
  console.error('==================================================\n');
  process.exit(1);
}

export const env = parseResult.data;
