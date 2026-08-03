/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * TestimonialsModeration — Administrator Testimonials Queue
 * Approve, reject, feature/unfeature, and moderate peer review submissions.
 */

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star, CheckCircle, XCircle, Trash2, Search, Linkedin, Globe } from 'lucide-react';
import { LiquidGlass } from '../LiquidGlass';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  text: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isFeatured: boolean;
  createdAt: string;
}

export const TestimonialsModeration: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());
      params.append('page', String(page));
      params.append('limit', '12');

      const res = await fetch(`/api/v1/testimonials/admin?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (data.success) {
        setTestimonials(data.data);
        if (data.meta?.pagination) {
          setTotalPages(data.meta.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error('Failed to fetch testimonials queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [statusFilter, search, page]);

  const handleModerate = async (id: string, newStatus: 'PENDING' | 'APPROVED' | 'REJECTED', isFeatured?: boolean) => {
    try {
      const res = await fetch(`/api/v1/testimonials/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus, isFeatured }),
      });
      const data = await res.json();

      if (data.success) {
        setTestimonials((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: newStatus,
                  isFeatured: typeof isFeatured === 'boolean' ? isFeatured : item.isFeatured,
                }
              : item
          )
        );
      }
    } catch (err) {
      console.error('Failed to moderate testimonial:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Permanently delete this testimonial?')) return;
    try {
      const res = await fetch(`/api/v1/testimonials/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();

      if (data.success) {
        setTestimonials((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete testimonial:', err);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={13}
        className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 font-mono text-xs w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
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

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search author, role, company..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-sky-500/50 transition-colors font-sans"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-white/30 text-xs font-mono">
          Loading moderation queue...
        </div>
      ) : testimonials.length === 0 ? (
        <LiquidGlass
          radius="1.25rem"
          distortion={6}
          blur={16}
          tint={0.05}
          interactive={false}
          className="p-12 text-center border border-white/10"
        >
          <Star size={24} className="mx-auto text-white/20 mb-3" />
          <p className="text-base font-semibold text-white/70 font-sans">No testimonials found</p>
          <p className="text-xs text-white/40 font-sans mt-1">Try selecting a different filter tab or search query.</p>
        </LiquidGlass>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LiquidGlass
                radius="1.25rem"
                distortion={8}
                blur={18}
                tint={0.07}
                interactive={false}
                className={`p-5 border flex flex-col justify-between h-full ${
                  item.status === 'PENDING'
                    ? 'border-amber-500/30 bg-amber-500/2'
                    : item.status === 'APPROVED'
                    ? 'border-emerald-500/30 bg-emerald-500/2'
                    : 'border-white/10 bg-white/2'
                }`}
              >
                <div>
                  {/* Header: Rating & Status Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      {renderStars(item.rating)}
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      {item.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                          FEATURED
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full border uppercase ${
                          item.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : item.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border-red-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-white/90 text-sm leading-relaxed font-sans mb-4 italic">
                    "{item.text}"
                  </p>

                  {/* Author Details */}
                  <div className="border-t border-white/8 pt-3 mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-xs font-sans">{item.name}</p>
                      <p className="text-white/40 text-[11px] font-sans">
                        {item.role} @ <span className="text-white/60 font-medium">{item.company}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-white/40">
                      {item.linkedinUrl && (
                        <a href={item.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-sky-400 transition-colors">
                          <Linkedin size={13} />
                        </a>
                      )}
                      {item.portfolioUrl && (
                        <a href={item.portfolioUrl} target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                          <Globe size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3 font-sans text-xs">
                  <div className="flex items-center gap-2">
                    {item.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleModerate(item.id, 'APPROVED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-medium flex items-center gap-1.5 transition-all duration-150 active:scale-[0.96] cursor-pointer"
                      >
                        <CheckCircle size={13} />
                        <span>Approve</span>
                      </button>
                    )}

                    {item.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleModerate(item.id, 'REJECTED')}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-medium flex items-center gap-1.5 transition-all duration-150 active:scale-[0.96] cursor-pointer"
                      >
                        <XCircle size={13} />
                        <span>Reject</span>
                      </button>
                    )}

                    {item.status === 'APPROVED' && (
                      <button
                        onClick={() => handleModerate(item.id, 'APPROVED', !item.isFeatured)}
                        className={`px-3 py-1.5 rounded-lg border font-medium transition-all duration-150 active:scale-[0.96] cursor-pointer ${
                          item.isFeatured
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-white/10 hover:bg-white/15 text-white/70 border-white/15'
                        }`}
                      >
                        ★ {item.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </LiquidGlass>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
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
    </div>
  );
};

export default TestimonialsModeration;
