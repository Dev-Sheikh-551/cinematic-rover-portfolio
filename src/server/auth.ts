/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Auth.js v5 Configuration — Portfolio Platform
 *
 * Architecture:
 *  - Google OAuth (primary provider — extensible for GitHub/others later)
 *  - PrismaAdapter stores users, accounts, sessions in PostgreSQL
 *  - Email allowlist: only ADMIN_EMAIL can sign in
 *  - lastLoginAt updated on every successful sign-in via events hook
 *  - Custom sign-in page at /administrator/login
 *  - Database session strategy (more secure than JWT for single-admin use)
 */

import { ExpressAuth } from '@auth/express';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from '@auth/express/providers/google';
import type { AuthConfig } from '@auth/core';
import { prisma } from '../lib/prisma/db';
import { env } from './config/env';
import { logger } from './logger';

// ── Type Augmentation ────────────────────────────────────────────────────────
// Extends the default Auth.js session/user types with portfolio-specific fields

declare module '@auth/core/types' {
  interface Session {
    user: {
      id: string;
      role: string;
      lastLoginAt?: string | null;
    } & {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User {
    role: string;
    lastLoginAt?: Date | null;
  }
}

// ── Core Auth Configuration ──────────────────────────────────────────────────

export const authConfig: Omit<AuthConfig, 'raw'> = {
  secret: env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),

  // Providers — add new providers here without restructuring auth logic
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      // Force account selection even if already signed into one Google account
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    }),
  ],

  // Database sessions — more secure for single-admin; no JWT rotation needed
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,    // Refresh session every 24h
  },

  // Custom pages — replaces stock Auth.js UI with the portfolio's design system
  pages: {
    signIn: '/administrator/login',
    error: '/administrator/login', // Error query param appended automatically
  },

  callbacks: {
    /**
     * signIn — Email allowlist gate
     * Runs before session creation. Any email !== ADMIN_EMAIL is rejected.
     * Returning a URL string sends the user to that page with ?error= appended.
     */
    async signIn({ user }) {
      if (!user.email || user.email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
        logger.warn(
          { email: user.email },
          'Sign-in rejected: email not on admin allowlist'
        );
        return '/administrator/login?error=AccessDenied';
      }
      return true;
    },

    /**
     * session — Attach role and id to the client-visible session object
     */
    async session({ session, user }) {
      if (session.user && user) {
        (session.user as { id?: string }).id = user.id;
        (session.user as { role?: string }).role = (user as { role?: string }).role ?? 'ADMIN';
      }
      return session;
    },
  },

  events: {
    /**
     * signIn event — runs after successful authentication and session creation
     * Updates lastLoginAt without blocking the auth flow
     */
    async signIn({ user }) {
      if (!user.id) return;
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
        logger.info({ userId: user.id, email: user.email }, 'Admin signed in — lastLoginAt updated');
      } catch (err) {
        // Non-critical — do not block the login flow
        logger.warn({ err, userId: user.id }, 'Failed to update lastLoginAt');
      }
    },
  },

  // Required in non-Vercel environments
  trustHost: true,

  // Logging (suppress in production to avoid leaking auth internals)
  debug: env.NODE_ENV === 'development',
};

// ── Express Auth Handler ─────────────────────────────────────────────────────
// Mount this at app.use('/api/auth', authHandler) in app.ts

export const authHandler = ExpressAuth(authConfig);
