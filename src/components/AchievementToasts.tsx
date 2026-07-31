/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AchievementToasts — Subtle Apple-Style Glass Notifications
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { themeStore } from '../themeStore';
import { sound } from './SoundManager';

interface ToastItem {
  id: string;
  title: string;
  description: string;
}

const ACHIEVEMENT_DESCS: Record<string, string> = {
  Explorer: 'Visited every section of the experience trajectory.',
  Curator: 'Inspected every project showcase in detail.',
  'Connection Established': 'Sent a message through the transmission terminal.',
  'Curious Mind': 'Discovered hidden system interactions & shortcuts.',
  'Story Complete': 'Reviewed all chapters of the engineering growth journey.',
};

export const AchievementToasts: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    let prevUnlocked = themeStore.getState().unlockedAchievements;

    const unsubscribe = themeStore.subscribe(() => {
      const currentUnlocked = themeStore.getState().unlockedAchievements;
      const newlyUnlocked = currentUnlocked.filter((id) => !prevUnlocked.includes(id));

      if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach((id) => {
          sound.playConfirm();
          const newToast: ToastItem = {
            id: `${id}-${Date.now()}`,
            title: id,
            description: ACHIEVEMENT_DESCS[id] || 'Unlocked exploration milestone.',
          };

          setToasts((prev) => [...prev, newToast]);

          // Auto dismiss after 4 seconds
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
          }, 4000);
        });
      }

      prevUnlocked = currentUnlocked;
    });

    return unsubscribe;
  }, []);

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="p-3.5 rounded-2xl bg-black/75 backdrop-blur-xl border border-emerald-400/40 text-white shadow-2xl flex items-start gap-3 pointer-events-auto"
          >
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Shield size={16} />
            </div>
            <div className="flex-1 font-mono">
              <div className="text-[10px] text-emerald-400 uppercase tracking-widest flex items-center gap-1 font-bold">
                <Sparkles size={10} />
                <span>Discovery Unlocked</span>
              </div>
              <div className="text-xs font-bold font-sans text-white mt-0.5">{toast.title}</div>
              <div className="text-[11px] font-sans text-white/60 leading-tight mt-0.5">{toast.description}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
