/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Application Entry Point
 *
 * Routes between the portfolio frontend and the administrator area
 * based on URL pathname — no React Router needed for this simple split.
 *
 *  /                     → Portfolio (cinematic rover experience)
 *  /administrator        → Admin dashboard (protected by AdminGuard)
 *  /administrator/login  → Custom Auth.js sign-in page
 */

import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import App from './App.tsx';
import './index.css';

const AdminLogin = lazy(() => import('./components/administrator/AdminLogin'));
const AdminGuard = lazy(() => import('./components/administrator/AdminGuard'));
const AdminShell = lazy(() => import('./components/administrator/AdminShell'));

const pathname = window.location.pathname;
const root = createRoot(document.getElementById('root')!);

// ── Administrator Routes ──────────────────────────────────────────────────────

if (pathname.startsWith('/administrator')) {
  if (pathname === '/administrator/login' || pathname === '/administrator/login/') {
    // Custom Auth.js sign-in page
    root.render(
      <Suspense fallback={null}>
        <AdminLogin />
      </Suspense>
    );
  } else {
    // Protected dashboard — AdminGuard validates session before rendering
    root.render(
      <Suspense fallback={null}>
        <AdminGuard>
          <AdminShell />
        </AdminGuard>
      </Suspense>
    );
  }
} else {
  // ── Portfolio Frontend ──────────────────────────────────────────────────────
  root.render(<App />);
}
