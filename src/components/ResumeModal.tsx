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
import { SpecularButton } from './SpecularButton';
import { personalData } from '../data/personal';
import { experienceData } from '../data/experience';
import { educationData } from '../data/education';
import { skillsData } from '../data/skills';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  docUrl?: string;
}

/**
 * HEAD-request check: returns true if file exists on server.
 */
async function checkFileExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

/** React hook that checks document availability once per URL. */
function useFileAvailable(url: string, shouldCheck: boolean) {
  const [status, setStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  useEffect(() => {
    if (!shouldCheck) return;
    setStatus('checking');
    checkFileExists(url).then(ok => setStatus(ok ? 'available' : 'unavailable'));
  }, [url, shouldCheck]);

  return status;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({
  isOpen,
  onClose,
  docUrl = '/Sheikh_Tijan_Touray_Resume.docx',
}) => {
  const [viewMode, setViewMode] = useState<'pdf' | 'digital'>('digital');
  const embedRef = useRef<HTMLEmbedElement>(null);

  // Check file availability when user opens document view
  const docStatus = useFileAvailable(docUrl, isOpen);

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
    window.open(docUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenNewTab = () => {
    sound.playConfirm();
    window.open(docUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = () => {
    sound.playConfirm();
    const link = document.createElement('a');
    link.href = docUrl;
    link.download = 'Sheikh_Tijan_Touray_Resume.docx';
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
                    <FileText size={11} />
                    <span>Document</span>
                  </button>
                </div>

                {/* Download Document */}
                <SpecularButton
                  size="sm"
                  radius={12}
                  baseColor="#064e3b"
                  lineColor="#10b98160"
                  textColor="#a7f3d0"
                  onClick={handleDownload}
                  title="Download Resume (.docx)"
                >
                  <Download size={12} className="text-emerald-400" />
                  <span className="hidden sm:inline">Download (.docx)</span>
                </SpecularButton>

                {/* Open in New Tab */}
                <SpecularButton
                  size="sm"
                  radius={12}
                  baseColor="#262626"
                  lineColor="#ffffff20"
                  textColor="#ffffff"
                  onClick={handleOpenNewTab}
                  title="Open in New Tab"
                >
                  <ExternalLink size={12} className="text-purple-400" />
                  <span className="hidden md:inline">Open File</span>
                </SpecularButton>

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
              
              {/* MODE 1: DOCUMENT DOWNLOAD / VIEW CARD */}
              {viewMode === 'pdf' && (
                <div className="w-full h-full min-h-[450px] flex flex-col items-center justify-center relative p-6">
                  <div className="flex flex-col items-center gap-6 p-8 text-center max-w-md border border-white/10 bg-white/[0.03] backdrop-blur-md rounded-2xl shadow-2xl">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400">
                      <FileText size={36} />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-sans font-bold text-white text-lg tracking-tight">
                        Sheikh Tijan Touray Resume
                      </h4>
                      <p className="font-mono text-xs text-emerald-400 tracking-wide">
                        Verified Document: Sheikh_Tijan_Touray_Resume.docx
                      </p>
                      <p className="font-sans text-xs text-white/60 leading-relaxed pt-1">
                        Professional resume file is ready for direct download and viewing.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <SpecularButton
                        size="md"
                        radius={14}
                        baseColor="#10b981"
                        lineColor="#34d399"
                        textColor="#000000"
                        intensity={1.2}
                        onClick={handleDownload}
                      >
                        <Download size={14} />
                        <span>Download Resume (.docx)</span>
                      </SpecularButton>

                      <SpecularButton
                        size="md"
                        radius={14}
                        baseColor="#262626"
                        lineColor="#ffffff25"
                        textColor="#ffffff"
                        onClick={() => { setViewMode('digital'); sound.playTick(); }}
                      >
                        <Eye size={14} />
                        <span>Interactive View</span>
                      </SpecularButton>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: INTERACTIVE DIGITAL RESUME (Liquid Glass Styled) */}
              {viewMode === 'digital' && (
                <div className="p-6 sm:p-8 space-y-8 font-sans text-white/90 selection:bg-white selection:text-black">
                  
                  {/* Header / Contact Identity */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        {personalData.name}
                      </h2>
                      <div className="text-emerald-400 font-mono text-xs mt-1 font-medium tracking-wide">
                        {personalData.title}
                      </div>
                    </div>

                    <div className="font-mono text-xs space-y-1 text-white/70">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-emerald-400" />
                        <span>{personalData.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe size={12} className="text-sky-400" />
                        <a href={`mailto:${personalData.email}`} className="hover:text-white transition-colors">{personalData.email}</a>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest font-bold">
                      // Profile
                    </div>
                    <p className="text-[15px] text-white/80 leading-[1.75] font-light">
                      {personalData.bioSummary}
                    </p>
                  </div>

                  {/* Skills Grid */}
                  <div className="space-y-3">
                    <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest font-bold">
                      // Technical Skills
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                      {skillsData.map((cat, i) => (
                        <div key={i} className="p-3 rounded-xl border border-white/10 bg-white/[0.04] space-y-1.5">
                          <div className={`font-bold ${
                            i === 0 ? 'text-sky-400' : i === 1 ? 'text-emerald-400' : 'text-purple-400'
                          }`}>{cat.label}</div>
                          <div className="text-[11px] text-white/70 leading-relaxed">
                            {cat.skills.map(s => s.name).join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-4">
                    <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-2">
                      <Briefcase size={12} className="text-emerald-400" />
                      <span>// Experience</span>
                    </div>

                    <div className="space-y-3 font-sans">
                      {experienceData.map((exp, i) => (
                        <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/[0.04] space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div>
                              <div className="font-bold text-white text-sm">{exp.role}</div>
                              <div className="font-mono text-[11px] text-white/50">{exp.company} · {exp.location}</div>
                            </div>
                            <div className="font-mono text-[11px] text-emerald-400 shrink-0">
                              {exp.period}{exp.current ? ' · Current' : ''}
                            </div>
                          </div>
                          <p className="text-xs text-white/70 leading-relaxed font-light">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="space-y-4">
                    <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-2">
                      <Sparkles size={12} className="text-sky-400" />
                      <span>// Education & Training</span>
                    </div>

                    <div className="space-y-3 font-sans">
                      {educationData.map((edu, i) => (
                        <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/[0.04] space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div>
                              <div className="font-bold text-white text-sm">{edu.institution}</div>
                              <div className="font-mono text-[11px] text-white/50">{edu.program}{edu.location ? ` · ${edu.location}` : ''}</div>
                            </div>
                            <div className={`font-mono text-[11px] shrink-0 ${
                              edu.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                              {edu.period} · {edu.status}
                            </div>
                          </div>
                        </div>
                      ))}
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
