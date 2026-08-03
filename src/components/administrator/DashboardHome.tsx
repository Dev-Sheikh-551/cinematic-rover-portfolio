/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * DashboardHome — Administrator Overview Tab
 * Renders summary metric cards, quick action alerts, and real-time system diagnostics.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Star, ShieldCheck, Mail, ArrowUpRight, Cpu, CheckCircle } from 'lucide-react';
import { LiquidGlass } from '../LiquidGlass';

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

interface DashboardHomeProps {
  onNavigate: (tab: 'home' | 'messages' | 'testimonials' | 'system') => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
  const [msgStats, setMsgStats] = useState({ unread: 0, total: 0 });
  const [testStats, setTestStats] = useState({ pending: 0, approved: 0, total: 0, averageRating: 5.0 });
  const [analytics, setAnalytics] = useState({ totalViews: 0, uniqueVisitors: 0, ctaClicks: 0, projectClicks: 0 });
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [msgRes, testRes, healthRes, analyticsRes] = await Promise.all([
          fetch('/api/v1/contact/stats', { credentials: 'include' }).then((r) => r.json()),
          fetch('/api/v1/testimonials/stats', { credentials: 'include' }).then((r) => r.json()),
          fetch('/api/v1/health').then((r) => r.json()),
          fetch('/api/v1/analytics/overview?timeframe=7d', { credentials: 'include' }).then((r) => r.json()),
        ]);

        if (msgRes.success) setMsgStats(msgRes.data);
        if (testRes.success) setTestStats(testRes.data);
        if (healthRes.success) setHealth(healthRes.data);
        if (analyticsRes.success) setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-8">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Messages Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => onNavigate('messages')}
          className="cursor-pointer group"
        >
          <LiquidGlass
            radius="1.25rem"
            distortion={6}
            blur={16}
            tint={0.07}
            interactive={true}
            className="p-5 border border-white/10 group-hover:border-emerald-500/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <MessageSquare size={16} />
              </div>
              <ArrowUpRight size={14} className="text-white/30 group-hover:text-emerald-400 transition-colors" />
            </div>

            <p className="text-white/40 text-[11px] uppercase tracking-widest font-mono mb-1">
              Messages
            </p>
            <p className="text-white text-3xl font-semibold font-sans mb-1">
              {loading ? '—' : msgStats.total}
            </p>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${msgStats.unread > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="text-white/50 text-[12px] font-sans">
                {loading ? '...' : `${msgStats.unread} unread`}
              </span>
            </div>
          </LiquidGlass>
        </motion.div>

        {/* Testimonials Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          onClick={() => onNavigate('testimonials')}
          className="cursor-pointer group"
        >
          <LiquidGlass
            radius="1.25rem"
            distortion={6}
            blur={16}
            tint={0.07}
            interactive={true}
            className="p-5 border border-white/10 group-hover:border-sky-500/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Star size={16} />
              </div>
              <ArrowUpRight size={14} className="text-white/30 group-hover:text-sky-400 transition-colors" />
            </div>

            <p className="text-white/40 text-[11px] uppercase tracking-widest font-mono mb-1">
              Testimonials
            </p>
            <p className="text-white text-3xl font-semibold font-sans mb-1">
              {loading ? '—' : testStats.total}
            </p>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${testStats.pending > 0 ? 'bg-amber-400 animate-pulse' : 'bg-sky-400'}`} />
              <span className="text-white/50 text-[12px] font-sans">
                {loading ? '...' : `${testStats.pending} pending review`}
              </span>
            </div>
          </LiquidGlass>
        </motion.div>

        {/* Average Rating Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.4 }}
        >
          <LiquidGlass
            radius="1.25rem"
            distortion={6}
            blur={16}
            tint={0.07}
            interactive={false}
            className="p-5 border border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldCheck size={16} />
              </div>
              <span className="text-amber-400 text-xs font-mono font-bold">★ 5.0</span>
            </div>

            <p className="text-white/40 text-[11px] uppercase tracking-widest font-mono mb-1">
              Average Rating
            </p>
            <p className="text-white text-3xl font-semibold font-sans mb-1">
              {loading ? '—' : `${testStats.averageRating} ★`}
            </p>
            <span className="text-white/50 text-[12px] font-sans">
              {loading ? '...' : `${testStats.approved} approved reviews`}
            </span>
          </LiquidGlass>
        </motion.div>

        {/* Analytics Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.4 }}
        >
          <LiquidGlass
            radius="1.25rem"
            distortion={6}
            blur={16}
            tint={0.07}
            interactive={false}
            className="p-5 border border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Cpu size={16} />
              </div>
              <span className="text-purple-400 text-xs font-mono font-bold">7d</span>
            </div>

            <p className="text-white/40 text-[11px] uppercase tracking-widest font-mono mb-1">
              Portfolio Views
            </p>
            <p className="text-white text-3xl font-semibold font-sans mb-1">
              {loading ? '—' : analytics.totalViews}
            </p>
            <div className="flex items-center gap-2">
              <CheckCircle size={12} className="text-emerald-400" />
              <span className="text-white/50 text-[12px] font-sans">
                {loading ? '...' : `${analytics.uniqueVisitors} unique visitors`}
              </span>
            </div>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* Quick Action Alerts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unread Messages Prompt */}
        <LiquidGlass
          radius="1.25rem"
          distortion={8}
          blur={20}
          tint={0.06}
          interactive={false}
          className="p-6 border border-white/10 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400 uppercase tracking-widest mb-3">
              <Mail size={14} />
              <span>Contact Inbox</span>
            </div>
            <h3 className="text-white text-xl font-semibold mb-2 font-sans">
              {msgStats.unread > 0
                ? `You have ${msgStats.unread} unread inquiry message${msgStats.unread > 1 ? 's' : ''}`
                : 'Your inbox is clear'}
            </h3>
            <p className="text-white/50 text-sm leading-relaxed font-sans mb-6">
              {msgStats.unread > 0
                ? 'Review incoming messages, update transmission statuses, and respond directly to portfolio visitors.'
                : 'All incoming transmissions have been read and processed.'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('messages')}
            className="w-fit px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all duration-150 active:scale-[0.96] flex items-center gap-2 cursor-pointer"
          >
            <span>Open Messages Inbox</span>
            <ArrowUpRight size={14} />
          </button>
        </LiquidGlass>

        {/* Pending Testimonials Prompt */}
        <LiquidGlass
          radius="1.25rem"
          distortion={8}
          blur={20}
          tint={0.06}
          interactive={false}
          className="p-6 border border-white/10 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-sky-400 uppercase tracking-widest mb-3">
              <Star size={14} />
              <span>Moderation Queue</span>
            </div>
            <h3 className="text-white text-xl font-semibold mb-2 font-sans">
              {testStats.pending > 0
                ? `${testStats.pending} review${testStats.pending > 1 ? 's' : ''} awaiting moderation`
                : 'No pending reviews'}
            </h3>
            <p className="text-white/50 text-sm leading-relaxed font-sans mb-6">
              {testStats.pending > 0
                ? 'Approve or reject submitted peer testimonials before they appear publicly on your portfolio.'
                : 'All submitted reviews have been moderated and processed.'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('testimonials')}
            className="w-fit px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs transition-all duration-150 active:scale-[0.96] flex items-center gap-2 cursor-pointer"
          >
            <span>Open Moderation Queue</span>
            <ArrowUpRight size={14} />
          </button>
        </LiquidGlass>
      </div>

      {/* Realtime System Status Bar */}
      {health && (
        <LiquidGlass
          radius="1.25rem"
          distortion={4}
          blur={12}
          tint={0.04}
          interactive={false}
          className="p-5 border border-white/8 flex flex-wrap items-center justify-between gap-4 font-mono text-xs"
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-white/80 font-bold uppercase tracking-wider">System Status: ONLINE</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-white/50">
            <span>Uptime: <strong className="text-white/80">{formatUptime(health.api.uptimeSeconds)}</strong></span>
            <span>Node: <strong className="text-white/80">{health.system.nodeVersion}</strong></span>
            <span>Memory: <strong className="text-white/80">{health.system.memory.heapUsed}</strong></span>
            <span>Env: <strong className="text-emerald-400">{health.api.environment}</strong></span>
          </div>
        </LiquidGlass>
      )}
    </div>
  );
};

export default DashboardHome;
