/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SystemSettings — Administrator System Diagnostics & Settings Tab
 * Renders live server health diagnostics, memory metrics, database latency, and session info.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, Database, Shield, BookOpen, CheckCircle, RefreshCw } from 'lucide-react';
import { LiquidGlass } from '../LiquidGlass';
import { useAdminSession } from './AdminGuard';

interface HealthData {
  api: {
    status: string;
    version: string;
    environment: string;
    uptimeSeconds: number;
    timestamp: string;
  };
  database: {
    status: string;
    latencyMs: number;
    provider: string;
  };
  system: {
    nodeVersion: string;
    platform: string;
    memory: {
      rss: string;
      heapTotal: string;
      heapUsed: string;
    };
  };
}

export const SystemSettings: React.FC = () => {
  const session = useAdminSession();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/health');
      const data = await res.json();
      if (data.success) {
        setHealth(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch system diagnostics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const formatUptime = (sec: number) => {
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${d > 0 ? `${d}d ` : ''}${h}h ${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-xl font-sans">System Diagnostics & Platform Settings</h2>
          <p className="text-white/40 text-xs font-sans mt-0.5">Live runtime environment metrics, database telemetry, and API documentation.</p>
        </div>
        <button
          onClick={fetchHealth}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-mono flex items-center gap-2 transition-all cursor-pointer active:scale-[0.96]"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Grid: Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Server Health Card */}
        <LiquidGlass
          radius="1.25rem"
          distortion={8}
          blur={20}
          tint={0.07}
          interactive={false}
          className="p-6 border border-white/10 space-y-4"
        >
          <div className="flex items-center gap-2 font-mono text-xs text-purple-400 uppercase tracking-widest border-b border-white/8 pb-3">
            <Cpu size={15} />
            <span>API Server Runtime</span>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-white/40 font-mono">API Version</span>
              <span className="text-white font-bold font-mono">v{health?.api?.version || '1.0.0'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-white/40 font-mono">Environment</span>
              <span className="text-emerald-400 font-bold uppercase font-mono">{health?.api?.environment || 'development'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-white/40 font-mono">Uptime Duration</span>
              <span className="text-white font-mono">{health ? formatUptime(health.api.uptimeSeconds) : '—'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-white/40 font-mono">Node.js Version</span>
              <span className="text-white/80 font-mono">{health?.system?.nodeVersion || '—'}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-white/40 font-mono">Platform OS</span>
              <span className="text-white/80 font-mono">{health?.system?.platform || '—'}</span>
            </div>
          </div>
        </LiquidGlass>

        {/* Database & Memory Card */}
        <LiquidGlass
          radius="1.25rem"
          distortion={8}
          blur={20}
          tint={0.07}
          interactive={false}
          className="p-6 border border-white/10 space-y-4"
        >
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 uppercase tracking-widest border-b border-white/8 pb-3">
            <Database size={15} />
            <span>Database & Memory Telemetry</span>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-white/40 font-mono">Database Provider</span>
              <span className="text-white font-bold uppercase font-mono">{health?.database?.provider || 'postgresql'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-white/40 font-mono">Connection Status</span>
              <span className="text-emerald-400 font-bold font-mono flex items-center gap-1.5">
                <CheckCircle size={12} />
                <span>{health?.database?.status || 'connected'}</span>
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-white/40 font-mono">Ping Latency</span>
              <span className="text-white font-bold font-mono">{health?.database?.latencyMs !== undefined ? `${health.database.latencyMs} ms` : '—'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-white/40 font-mono">Heap Total Memory</span>
              <span className="text-white/80 font-mono">{health?.system?.memory?.heapTotal || '—'}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-white/40 font-mono">Heap Used Memory</span>
              <span className="text-white/80 font-mono">{health?.system?.memory?.heapUsed || '—'}</span>
            </div>
          </div>
        </LiquidGlass>
      </div>

      {/* Grid: Session & OpenAPI Docs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Administrator Session Info */}
        <LiquidGlass
          radius="1.25rem"
          distortion={6}
          blur={16}
          tint={0.06}
          interactive={false}
          className="p-6 border border-white/10 space-y-4"
        >
          <div className="flex items-center gap-2 font-mono text-xs text-sky-400 uppercase tracking-widest border-b border-white/8 pb-3">
            <Shield size={15} />
            <span>Active Administrator Session</span>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-white/40 font-mono">Authenticated Email</span>
              <span className="text-emerald-400 font-bold font-mono">{session?.user?.email}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-white/40 font-mono">Administrator Role</span>
              <span className="text-white font-bold uppercase font-mono">{session?.user?.role || 'ADMIN'}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-white/40 font-mono">Session Expires</span>
              <span className="text-white/70 font-mono">{session?.expires ? new Date(session.expires).toLocaleDateString() : '—'}</span>
            </div>
          </div>
        </LiquidGlass>

        {/* Interactive OpenAPI Documentation Quick Link */}
        <LiquidGlass
          radius="1.25rem"
          distortion={6}
          blur={16}
          tint={0.06}
          interactive={false}
          className="p-6 border border-white/10 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-amber-400 uppercase tracking-widest mb-3">
              <BookOpen size={15} />
              <span>Interactive OpenAPI Specs</span>
            </div>

            <h3 className="text-white text-lg font-semibold font-sans mb-1">
              Swagger UI Documentation
            </h3>
            <p className="text-white/50 text-xs leading-relaxed font-sans mb-4">
              Explore the auto-generated OpenAPI 3.0 endpoints for `/api/v1/health`, `/api/v1/contact`, and `/api/v1/testimonials`.
            </p>
          </div>

          <a
            href="/docs"
            target="_blank"
            rel="noreferrer"
            className="w-fit px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all duration-150 active:scale-[0.96] flex items-center gap-2 cursor-pointer"
          >
            <span>Open Swagger UI (/docs)</span>
            <BookOpen size={14} />
          </a>
        </LiquidGlass>
      </div>
    </div>
  );
};

export default SystemSettings;
