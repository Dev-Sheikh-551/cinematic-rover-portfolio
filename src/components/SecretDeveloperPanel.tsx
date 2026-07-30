/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Cpu, RefreshCw, Radio, HardDrive, Play, Zap, X } from 'lucide-react';
import { sound } from './SoundManager';

interface SecretDeveloperPanelProps {
  isOpen: boolean;
  onClose: () => void;
  scrollProgress: number;
}

export const SecretDeveloperPanel: React.FC<SecretDeveloperPanelProps> = ({ isOpen, onClose, scrollProgress }) => {
  const [cpuTemp, setCpuTemp] = useState(42);
  const [signalStrength, setSignalStrength] = useState(94);
  const [systemFlux, setSystemFlux] = useState(1.02);

  // Fluctuating tech diagnostics mockups
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCpuTemp(prev => Math.min(65, Math.max(38, prev + (Math.random() - 0.5) * 4)));
      setSignalStrength(prev => Math.min(100, Math.max(85, prev + (Math.random() - 0.5) * 2)));
      setSystemFlux(prev => Number((prev + (Math.random() - 0.5) * 0.05).toFixed(2)));
    }, 1200);

    return () => clearInterval(interval);
  }, [isOpen]);

  const testAudio = (type: 'tick' | 'confirm' | 'holo' | 'error') => {
    if (type === 'tick') sound.playTick();
    if (type === 'confirm') sound.playConfirm();
    if (type === 'holo') sound.playHoloOn();
    if (type === 'error') sound.playError();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateX: -15 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.9, rotateX: -15 }}
          className="w-full max-w-lg border border-red-500/30 bg-black/95 p-6 rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.15)] flex flex-col font-mono text-xs text-white"
        >
          {/* Header block with flashing warning shield */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-2.5">
              <Shield className="text-red-500 animate-pulse" size={18} />
              <div>
                <div className="text-[10px] text-red-400 font-bold tracking-wider">SECURE DIAGNOSTICS DECK // UNLOCKED</div>
                <div className="text-white font-sans text-sm font-semibold uppercase tracking-tight">Helios Flight Log</div>
              </div>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Grid Layout of Telemetry Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 border border-white/5 rounded-xl bg-white/2 space-y-1">
              <div className="text-white/40 text-[9px] flex items-center gap-1">
                <Cpu size={10} /> CORE_TEMP
              </div>
              <div className="text-base text-white font-semibold">
                {cpuTemp.toFixed(1)}°C <span className="text-[9px] text-emerald-400 font-normal">NOMINAL</span>
              </div>
            </div>

            <div className="p-3 border border-white/5 rounded-xl bg-white/2 space-y-1">
              <div className="text-white/40 text-[9px] flex items-center gap-1">
                <Radio size={10} /> TRANSMITTER_LINK
              </div>
              <div className="text-base text-white font-semibold">
                {signalStrength.toFixed(0)}dBm <span className="text-[9px] text-emerald-400 font-normal">99.9%</span>
              </div>
            </div>

            <div className="p-3 border border-white/5 rounded-xl bg-white/2 space-y-1">
              <div className="text-white/40 text-[9px] flex items-center gap-1">
                <Zap size={10} /> INDUCT_FLUX
              </div>
              <div className="text-base text-white font-semibold">
                {systemFlux} T_FLX <span className="text-[9px] text-amber-400 animate-pulse font-normal">WARPING</span>
              </div>
            </div>

            <div className="p-3 border border-white/5 rounded-xl bg-white/2 space-y-1">
              <div className="text-white/40 text-[9px] flex items-center gap-1">
                <HardDrive size={10} /> SCROLL_VECTOR
              </div>
              <div className="text-base text-white font-semibold">
                {(scrollProgress * 100).toFixed(1)}% <span className="text-[9px] text-sky-400 font-normal">STATION_POS</span>
              </div>
            </div>
          </div>

          {/* Live graphic waveform visual */}
          <div className="mb-6 p-4 border border-white/5 rounded-2xl bg-black/80 h-28 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <svg viewBox="0 0 100 30" className="w-full h-full text-red-500/70">
              <path
                d="M 0 15 Q 15 5 30 15 T 60 15 T 90 15 L 100 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="animate-[pulse_1.5s_infinite_ease-in-out]"
              >
                <animate attributeName="d" values="M 0 15 Q 15 5 30 15 T 60 15 T 90 15 L 100 15; M 0 15 Q 15 25 30 15 T 60 15 T 90 15 L 100 15; M 0 15 Q 15 5 30 15 T 60 15 T 90 15 L 100 15" dur="3s" repeatCount="indefinite" />
              </path>
            </svg>
            <div className="absolute bottom-2 left-3 text-[7px] text-white/30 tracking-widest">// FLUX_INTEGRATOR_SIGNAL</div>
          </div>

          {/* Sound Testing suite */}
          <div className="mb-4">
            <div className="text-white/40 text-[9px] uppercase tracking-widest mb-2">// SIGNAL_AUDIO_SYNTHESIS_TEST</div>
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => testAudio('tick')} className="border border-white/10 hover:border-white/50 bg-white/2 hover:bg-white/10 p-2 rounded-xl flex flex-col items-center gap-1 transition-colors">
                <Play size={10} className="text-white/60" />
                <span className="text-[7px]">TICK</span>
              </button>
              <button onClick={() => testAudio('confirm')} className="border border-white/10 hover:border-white/50 bg-white/2 hover:bg-white/10 p-2 rounded-xl flex flex-col items-center gap-1 transition-colors">
                <Play size={10} className="text-white/60" />
                <span className="text-[7px]">CONFIRM</span>
              </button>
              <button onClick={() => testAudio('holo')} className="border border-white/10 hover:border-white/50 bg-white/2 hover:bg-white/10 p-2 rounded-xl flex flex-col items-center gap-1 transition-colors">
                <Play size={10} className="text-white/60" />
                <span className="text-[7px]">HOLO</span>
              </button>
              <button onClick={() => testAudio('error')} className="border border-white/10 hover:border-white/50 bg-white/2 hover:bg-white/10 p-2 rounded-xl flex flex-col items-center gap-1 transition-colors">
                <Play size={10} className="text-white/60" />
                <span className="text-[7px]">ERROR</span>
              </button>
            </div>
          </div>

          <div className="text-[8px] text-white/20 text-center select-none pt-2 border-t border-white/5">
            SYS_SEC: SECURE DIAGNOSTIC COOP // 2026-07-20
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
