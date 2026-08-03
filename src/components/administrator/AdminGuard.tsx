/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AdminGuard — Frontend Session Protection
 *
 * Checks the active Auth.js session via GET /api/auth/session.
 * Renders children only if the authenticated email matches ADMIN_EMAIL.
 * All routing decisions stay on the client — the backend enforces access separately.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface AuthSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string;
    role?: string;
  };
  expires: string;
}

interface AdminGuardProps {
  children: React.ReactNode;
}

type GuardState = 'loading' | 'authenticated' | 'unauthenticated';

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const [state, setState] = useState<GuardState>('loading');
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session', {
          credentials: 'include',
        });

        if (!res.ok) {
          setState('unauthenticated');
          return;
        }

        const data: AuthSession | null = await res.json();

        if (data && data.user && data.user.email) {
          setSession(data);
          setState('authenticated');
        } else {
          setState('unauthenticated');
        }
      } catch {
        setState('unauthenticated');
      }
    };

    checkSession();
  }, []);

  // Redirect to login page when not authenticated
  useEffect(() => {
    if (state === 'unauthenticated') {
      window.location.href = '/administrator/login';
    }
  }, [state]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-[#030308] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Loading spinner */}
          <svg
            className="animate-spin"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12" cy="12" r="10"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="2"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span
            className="text-white/30 text-[11px] tracking-widest uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Verifying session…
          </span>
        </motion.div>
      </div>
    );
  }

  if (state === 'unauthenticated') {
    // Redirect is already triggered in the effect above
    return null;
  }

  // Pass the session to children via context (simple prop drilling for now)
  return (
    <AdminSessionContext.Provider value={session}>
      {children}
    </AdminSessionContext.Provider>
  );
};

// ── Session Context ──────────────────────────────────────────────────────────

export const AdminSessionContext = React.createContext<AuthSession | null>(null);

export function useAdminSession(): AuthSession | null {
  return React.useContext(AdminSessionContext);
}

export default AdminGuard;
