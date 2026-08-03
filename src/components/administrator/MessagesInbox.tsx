/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MessagesInbox — Administrator Contact Messages Inbox
 * Live search, status filter tabs, detail modal, mailto reply, archive & deletion.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Mail, Archive, Trash2, ExternalLink, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { LiquidGlass } from '../LiquidGlass';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED';
  isSpam: boolean;
  createdAt: string;
}

export const MessagesInbox: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());
      params.append('page', String(page));
      params.append('limit', '15');

      const res = await fetch(`/api/v1/contact?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (data.success) {
        setMessages(data.data);
        if (data.meta?.pagination) {
          setTotalPages(data.meta.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter, search, page]);

  const handleOpenMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (msg.status === 'UNREAD') {
      try {
        await fetch(`/api/v1/contact/${msg.id}`, { credentials: 'include' });
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: 'READ' } : m))
        );
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED') => {
    try {
      const res = await fetch(`/api/v1/contact/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
        );
        if (selectedMessage?.id === id) {
          setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Permanently delete this contact message?')) return;
    try {
      const res = await fetch(`/api/v1/contact/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UNREAD':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'READ':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'REPLIED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'ARCHIVED':
        return 'bg-white/10 text-white/40 border-white/15';
      default:
        return 'bg-white/10 text-white/60 border-white/15';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 font-mono text-xs w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'UNREAD', 'READ', 'REPLIED', 'ARCHIVED'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setStatusFilter(tab); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer active:scale-[0.96] uppercase tracking-wider text-[11px] ${
                statusFilter === tab
                  ? 'bg-white/15 border-white/30 text-white font-semibold shadow'
                  : 'border-transparent text-white/40 hover:text-white/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search sender, email, subject..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors font-sans"
          />
        </div>
      </div>

      {/* Messages List Container */}
      <LiquidGlass
        radius="1.25rem"
        distortion={8}
        blur={20}
        tint={0.06}
        interactive={false}
        className="p-4 border border-white/10 min-h-[400px]"
      >
        {loading ? (
          <div className="py-20 text-center text-white/30 text-xs font-mono">
            Loading transmissions...
          </div>
        ) : messages.length === 0 ? (
          <div className="py-20 text-center text-white/40 font-sans space-y-2">
            <Mail size={24} className="mx-auto text-white/20 mb-3" />
            <p className="text-base font-semibold text-white/70">No messages found</p>
            <p className="text-xs text-white/40">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleOpenMessage(msg)}
                className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  msg.status === 'UNREAD'
                    ? 'bg-white/8 border-white/20 hover:border-emerald-500/40'
                    : 'bg-white/2 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      msg.status === 'UNREAD' ? 'bg-amber-400 animate-pulse' : 'bg-transparent'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white font-semibold text-sm truncate font-sans">
                        {msg.name}
                      </span>
                      <span className="text-white/40 text-xs font-mono truncate">
                        &lt;{msg.email}&gt;
                      </span>
                    </div>
                    <p className="text-white/60 text-xs truncate font-sans">
                      {msg.subject || 'Portfolio Inquiry'} —{' '}
                      <span className="text-white/40">{msg.message}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-center">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border uppercase ${getStatusBadge(
                      msg.status
                    )}`}
                  >
                    {msg.status}
                  </span>
                  <span className="text-white/30 text-[11px] font-mono">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </LiquidGlass>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs font-mono text-white/50 pt-2">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded-lg border border-white/10 hover:border-white/30 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg border border-white/10 hover:border-white/30 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Message Detail Modal Drawer */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="w-full max-w-2xl max-h-[85vh] flex flex-col"
            >
              <LiquidGlass
                radius="1.5rem"
                distortion={10}
                blur={24}
                tint={0.12}
                interactive={false}
                className="p-6 border border-white/20 shadow-2xl flex flex-col h-full overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-emerald-400" />
                    <span className="text-white font-bold font-sans text-base">Transmission Detail</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border uppercase ${getStatusBadge(selectedMessage.status)}`}>
                      {selectedMessage.status}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 active:scale-[0.96] transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Body Content */}
                <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar text-sm font-sans pr-2">
                  <div className="bg-white/5 border border-white/8 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-bold text-base">{selectedMessage.name}</p>
                        <a href={`mailto:${selectedMessage.email}`} className="text-emerald-400 text-xs font-mono hover:underline">
                          {selectedMessage.email}
                        </a>
                      </div>
                      <span className="text-white/40 text-xs font-mono">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {selectedMessage.subject && (
                      <p className="text-white/80 font-medium text-xs border-t border-white/6 pt-2">
                        Subject: <span className="text-white">{selectedMessage.subject}</span>
                      </p>
                    )}
                  </div>

                  <div className="bg-white/3 border border-white/6 p-5 rounded-xl text-white/90 leading-relaxed whitespace-pre-wrap font-sans text-sm">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="border-t border-white/10 pt-4 mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'Portfolio Inquiry')}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => handleUpdateStatus(selectedMessage.id, 'REPLIED')}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 transition-all duration-150 active:scale-[0.96] cursor-pointer"
                    >
                      <ExternalLink size={14} />
                      <span>Reply via Email</span>
                    </a>

                    <button
                      onClick={() => handleUpdateStatus(selectedMessage.id, selectedMessage.status === 'ARCHIVED' ? 'READ' : 'ARCHIVED')}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-medium text-xs flex items-center gap-2 transition-all duration-150 active:scale-[0.96] cursor-pointer"
                    >
                      <Archive size={14} />
                      <span>{selectedMessage.status === 'ARCHIVED' ? 'Unarchive' : 'Archive'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs flex items-center gap-1.5 transition-all duration-150 active:scale-[0.96] cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </LiquidGlass>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessagesInbox;
