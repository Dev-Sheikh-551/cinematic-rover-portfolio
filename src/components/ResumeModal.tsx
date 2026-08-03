/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ResumeModal — Phase 3 Premium Apple-Inspired Liquid Glass Resume Viewer
 *
 * Features:
 *  - Responsive Liquid Glass modal viewer (Desktop, Tablet, Mobile)
 *  - Embedded PDF preview + Interactive Digital Resume View switcher
 *  - Toolbar: Download PDF, Print, Open in New Tab, Close
 *  - Smooth shared layout transitions (AnimatePresence)
 *  - Keeps visitors inside the portfolio without redirects
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Download,
  Printer,
  ExternalLink,
  X,
  Sparkles,
  Briefcase,
  MapPin,
  Globe,
  Eye,
  AlertCircle
} from 'lucide-react';
import { sound } from './SoundManager';
import { LiquidGlass } from './LiquidGlass';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl?: string;
}

/**
 * HEAD-request check: returns true only if the server responds with a
 * Content-Type that starts with "application/pdf". This prevents the
 * iframe/embed from ever receiving the SPA's index.html.
 */
async function checkPdfExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    const ct = res.headers.get('content-type') ?? '';
    return res.ok && ct.startsWith('application/pdf');
  } catch {
    return false;
  }
}

/** React hook that checks PDF availability once per URL. */
function usePdfAvailable(url: string, shouldCheck: boolean) {
  const [status, setStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  useEffect(() => {
    if (!shouldCheck) return;
    setStatus('checking');
    checkPdfExists(url).then(ok => setStatus(ok ? 'available' : 'unavailable'));
  }, [url, shouldCheck]);

  return status;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({
  isOpen,
  onClose,
  pdfUrl = '/resume.pdf',
}) => {
  const [viewMode, setViewMode] = useState<'pdf' | 'digital'>('digital');
  const embedRef = useRef<HTMLEmbedElement>(null);

  // Only run the availability check when the user switches to PDF mode.
  const pdfStatus = usePdfAvailable(pdfUrl, viewMode === 'pdf' && isOpen);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handlePrint = () => {
    sound.playConfirm();
    // For embedded PDFs the browser's native print dialog handles the document.
    // We open the PDF in a new tab so the user can print it without issues.
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenNewTab = () => {
    sound.playConfirm();
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = () => {
    sound.playConfirm();
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Sheikh_Tijan_Touray_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-auto">
        {/* Backdrop Dismiss */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
        />

        {/* Main Liquid Glass Modal Wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          className="relative w-full max-w-4xl h-[88vh] flex flex-col z-10 select-none"
        >
          <LiquidGlass
            radius="1.75rem"
            distortion={10}
            blur={24}
            tint={0.1}
            interactive={false}
            contentClassName="h-full flex flex-col min-h-0 overflow-hidden"
            className="p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col h-full border border-white/20"
          >
            {/* TOOLBAR / HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4 flex-shrink-0">
              
              {/* Document Meta Title */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-400 tracking-wider uppercase font-bold">
                    <span>CURRICULUM VITAE // VERIFIED</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h3 className="text-base font-sans font-bold text-white tracking-tight">
                    Sheikh Tijan Touray
                  </h3>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                
                {/* View Switcher (Digital vs PDF) */}
                <div className="flex items-center p-0.5 bg-white/5 rounded-xl border border-white/10 font-mono text-[10px] mr-1">
                  <button
                    onClick={() => { setViewMode('digital'); sound.playTick(); }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === 'digital'
                        ? 'bg-white/15 text-white font-medium shadow'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <Sparkles size={11} />
                    <span className="hidden xs:inline">Interactive</span>
                  </button>
                  <button
                    onClick={() => { setViewMode('pdf'); sound.playTick(); }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === 'pdf'
                        ? 'bg-white/15 text-white font-medium shadow'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <Eye size={11} />
                    <span>PDF</span>
                  </button>
                </div>

                {/* Download PDF */}
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 active:scale-[0.96] text-white font-mono text-[10px] transition-all duration-150 cursor-pointer"
                  title="Download PDF"
                >
                  <Download size={12} className="text-emerald-400" />
                  <span className="hidden sm:inline">Download</span>
                </button>

                {/* Print */}
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 active:scale-[0.96] text-white font-mono text-[10px] transition-all duration-150 cursor-pointer"
                  title="Print Document"
                >
                  <Printer size={12} className="text-sky-400" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                {/* Open in New Tab */}
                <button
                  onClick={handleOpenNewTab}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 active:scale-[0.96] text-white font-mono text-[10px] transition-all duration-150 cursor-pointer"
                  title="Open in New Tab"
                >
                  <ExternalLink size={12} className="text-purple-400" />
                  <span className="hidden md:inline">New Tab</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 active:scale-[0.96] transition-all duration-150 cursor-pointer ml-1"
                  aria-label="Close Resume Viewer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* VIEWER CONTENT AREA */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar relative rounded-2xl bg-black/40 border border-white/10">
              
              {/* MODE 1: EMBEDDED PDF PREVIEW */}
              {viewMode === 'pdf' && (
                <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center relative">

                  {/* Checking availability */}
                  {pdfStatus === 'checking' && (
                    <div className="flex flex-col items-center gap-3 text-white/50 font-mono text-xs">
                      <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-emerald-400 animate-spin" />
                      <span>Loading PDF…</span>
                    </div>
                  )}

                  {/* PDF confirmed — render with <embed> (never loads HTML) */}
                  {pdfStatus === 'available' && (
                    <embed
                      ref={embedRef}
                      src={pdfUrl}
                      type="application/pdf"
                      title="Sheikh Tijan Touray Resume PDF"
                      className="w-full h-full min-h-[500px] rounded-2xl border-none"
                    />
                  )}

                  {/* PDF not found — clean fallback, never loads the app */}
                  {pdfStatus === 'unavailable' && (
                    <div className="flex flex-col items-center gap-5 p-8 text-center max-w-sm">
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/20 text-amber-400">
                        <AlertCircle size={28} />
                      </div>
                      <div className="space-y-1.5">
                        <p className="font-sans font-semibold text-white/90 text-sm">
                          PDF not available
                        </p>
                        <p className="font-mono text-[11px] text-white/45 leading-relaxed">
                          The resume PDF hasn't been uploaded yet.<br />
                          Use the Interactive view or download when available.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setViewMode('digital'); sound.playTick(); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 text-white font-mono text-[11px] transition-all cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>Interactive View</span>
                        </button>
                        <button
                          onClick={handleOpenNewTab}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-mono text-[11px] transition-all cursor-pointer"
                        >
                          <ExternalLink size={12} />
                          <span>Try Direct Link</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* MODE 2: INTERACTIVE DIGITAL RESUME (Liquid Glass Styled) */}
              {viewMode === 'digital' && (
                <div className="p-6 sm:p-8 space-y-8 font-sans text-white/90 selection:bg-white selection:text-black">
                  
                  {/* Header / Contact Identity */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        Sheikh Tijan Touray
                      </h2>
                      <div className="text-emerald-400 font-mono text-xs mt-1 font-medium tracking-wide">
                        Frontend Engineer &amp; Interactive Web Developer
                      </div>
                    </div>

                    <div className="font-mono text-xs space-y-1 text-white/70">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-emerald-400" />
                        <span>The Gambia</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe size={12} className="text-sky-400" />
                        <span>sheikhtijan.dev</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest font-bold">
                      // Executive Summary
                    </div>
                    <p className="text-[15px] text-white/80 leading-[1.75] font-light">
                      Frontend engineer driven by craftsmanship, modern web standards, and fine-tuned interactive design. Proven track record of building production React/Next.js storefronts, WebGL/Canvas physics integrations, state architectures, and responsive UI systems.
                    </p>
                  </div>

                  {/* Skills Grid */}
                  <div className="space-y-3">
                    <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest font-bold">
                      // Technical Core
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                      <div className="p-3 rounded-xl border border-white/10 bg-white/4 space-y-1">
                        <div className="text-sky-400 font-bold">Frontend</div>
                        <div className="text-[11px] text-white/70">React, Next.js, TypeScript, Tailwind CSS</div>
                      </div>

                      <div className="p-3 rounded-xl border border-white/10 bg-white/4 space-y-1">
                        <div className="text-emerald-400 font-bold">Animation &amp; 3D</div>
                        <div className="text-[11px] text-white/70">Three.js, WebGL, GSAP, Framer Motion</div>
                      </div>

                      <div className="p-3 rounded-xl border border-white/10 bg-white/4 space-y-1">
                        <div className="text-purple-400 font-bold">Backend &amp; Data</div>
                        <div className="text-[11px] text-white/70">Node.js, Express, PostgreSQL, Prisma</div>
                      </div>

                      <div className="p-3 rounded-xl border border-white/10 bg-white/4 space-y-1">
                        <div className="text-amber-400 font-bold">Tooling</div>
                        <div className="text-[11px] text-white/70">Git, GitHub, Docker, Vite, Figma</div>
                      </div>
                    </div>
                  </div>

                  {/* Experience Chronology */}
                  <div className="space-y-4">
                    <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-2">
                      <Briefcase size={12} className="text-emerald-400" />
                      <span>// Experience &amp; Projects</span>
                    </div>

                    <div className="space-y-3 font-sans">
                      <div className="p-4 rounded-xl border border-white/10 bg-white/4 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="font-bold text-white text-sm">Independent &amp; Client Storefront Creator</div>
                          <div className="font-mono text-[11px] text-emerald-400">2024 – Present</div>
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed font-light">
                          Engineered custom web applications featuring WebGL/Canvas 3D physics, glassmorphic UI systems, and optimized Next.js App Router performance for international clients.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl border border-white/10 bg-white/4 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="font-bold text-white text-sm">Jasseh Code Camp (JCC) Bootcamp</div>
                          <div className="font-mono text-[11px] text-sky-400">2024</div>
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed font-light">
                          Mastered team Git workflows, production state architecture, custom hooks, and strict TypeScript interfaces during intensive hands-on bootcamps.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl border border-white/10 bg-white/4 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="font-bold text-white text-sm">FreeCodeCamp &amp; Scrimba Certifications</div>
                          <div className="font-mono text-[11px] text-purple-400">2023 – 2024</div>
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed font-light">
                          Completed comprehensive certifications in Responsive Web Design, JavaScript Algorithms &amp; Data Structures, and Modern React Systems.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* FOOTER METADATA */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-white/40 flex-shrink-0">
              <span>SHEIKH TIJAN TOURAY // RESUME VIEWER</span>
              <span>PRESS ESC TO CLOSE</span>
            </div>

          </LiquidGlass>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
