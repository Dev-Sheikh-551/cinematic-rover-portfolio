/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AdminShell — Protected Administrator Dashboard Shell
 * Full dashboard container with tabbed navigation: Overview, Messages, Testimonials, System.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, MessageSquare, Star, Settings, LogOut, ExternalLink } from 'lucide-react';
import { useAdminSession } from './AdminGuard';
import DashboardHome from './DashboardHome';
import MessagesInbox from './MessagesInbox';
import TestimonialsModeration from './TestimonialsModeration';
import SystemSettings from './SystemSettings';

type ActiveTab = 'home' | 'messages' | 'testimonials' | 'system';

export const AdminShell: React.FC = () => {
  const session = useAdminSession();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  const handleSignOut = () => {
    window.location.href = '/api/auth/signout';
  };

  const navItems = [
    { id: 'home', label: 'Overview', icon: LayoutDashboard },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'testimonials', label: 'Testimonials', icon: Star },
    { id: 'system', label: 'System & Docs', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#030308] text-white relative overflow-x-hidden">
      {/* Background radial gradient glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 50% 10%, rgba(16,185,129,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 80% 60%, rgba(56,189,248,0.04) 0%, transparent 60%)
          `,
        }}
      />

      {/* Top Fixed Header */}
      <header
        className="fixed top-0 left-0 right-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between border-b border-white/8"
        style={{ background: 'rgba(3,3,8,0.85)', backdropFilter: 'blur(24px)' }}
      >
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold tracking-wider hover:opacity-80 transition-opacity"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.06) 100%)',
              border: '1px solid rgba(255,255,255,0.18)',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            ST
          </a>
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-xs font-sans">Portfolio Platform</span>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-white font-semibold text-xs font-sans">Administrator</span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors font-sans"
          >
            <span>View Portfolio</span>
            <ExternalLink size={12} />
          </a>

          {session?.user?.email && (
            <span className="hidden md:inline text-xs text-emerald-400 font-mono font-medium">
              {session.user.email}
            </span>
          )}

          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-sans flex items-center gap-1.5 transition-all duration-150 active:scale-[0.96] cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-24 px-4 md:px-8 pb-16 max-w-6xl mx-auto relative z-10">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium font-sans flex items-center gap-2 transition-all duration-150 cursor-pointer active:scale-[0.96] ${
                    isActive
                      ? 'bg-white/12 border border-white/20 text-white shadow-lg'
                      : 'border border-transparent text-white/40 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-emerald-400' : 'text-white/40'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:block font-mono text-[11px] text-white/30 uppercase tracking-widest">
            {activeTab}
          </div>
        </div>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home' && (
              <DashboardHome onNavigate={(tab) => setActiveTab(tab)} />
            )}
            {activeTab === 'messages' && <MessagesInbox />}
            {activeTab === 'testimonials' && <TestimonialsModeration />}
            {activeTab === 'system' && <SystemSettings />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminShell;
