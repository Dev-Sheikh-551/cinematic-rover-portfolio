/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Prisma 7 Configuration File
 */

import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/portfolio',
  },
});
