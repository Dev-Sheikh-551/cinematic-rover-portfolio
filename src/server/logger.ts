/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * High-Performance Structured Logger (Pino)
 * Formats info, warn, error logs with ISO timestamps and requestId context.
 */

import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

export default logger;
