/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, ShieldAlert, Sliders, Volume2, VolumeX, Eye, Sparkles, Navigation, X, Camera } from 'lucide-react';
import { sound } from './SoundManager';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
  onToggleMute: () => void;
  isMuted: boolean;
  onToggleAlternateTheme: () => void;
  isAlternateTheme: boolean;
  onToggleKonami: () => void;
  isKonamiActive: boolean;
  onOpenSecretPanel: () => void;
  isDroneView: boolean;
  onToggleDroneView: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onToggleMute,
  isMuted,
  onToggleAlternateTheme,
  isAlternateTheme,
  onToggleKonami,
  isKonamiActive,
  onOpenSecretPanel,
  isDroneView,
  onToggleDroneView,
}) => {
  const [filterText, setFilterText] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      sound.playConfirm();
    }
  }, [isOpen]);

  // Handle outside click to close
  const paletteRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  const commands = [
    {
      id: 'nav-hero',
      title: 'Navigate // HERO_DESTINATION',
      category: 'NAVIGATION',
      action: () => onNavigate('hero'),
      icon: <Navigation size={12} />
    },
    {
      id: 'nav-about',
      title: 'Navigate // ABOUT_PILOT_STATION',
      category: 'NAVIGATION',
      action: () => onNavigate('about'),
      icon: <Navigation size={12} />
    },
    {
      id: 'nav-skills',
      title: 'Navigate // SKILLS_COGNITIVE_ARRAY',
      category: 'NAVIGATION',
      action: () => onNavigate('skills'),
      icon: <Navigation size={12} />
    },
    {
      id: 'nav-projects',
      title: 'Navigate // EXHIBITION_SHELVES',
      category: 'NAVIGATION',
      action: () => onNavigate('projects'),
      icon: <Navigation size={12} />
    },
    {
      id: 'nav-timeline',
      title: 'Navigate // JOURNEY_LOG_STATIONS',
      category: 'NAVIGATION',
      action: () => onNavigate('timeline'),
      icon: <Navigation size={12} />
    },
    {
      id: 'nav-contact',
      title: 'Navigate // HELIOS_COMMAND_TERMINAL',
      category: 'NAVIGATION',
      action: () => onNavigate('contact'),
      icon: <Navigation size={12} />
    },
    {
      id: 'toggle-mute',
      title: isMuted ? 'Telemetry System Audio // AUDIO_ENGAGE' : 'Telemetry System Audio // AUDIO_MUTE',
      category: 'SYSTEM',
      action: onToggleMute,
      icon: isMuted ? <Volume2 size={12} /> : <VolumeX size={12} />
    },
    {
      id: 'toggle-theme',
      title: isAlternateTheme ? 'Core Laser Hue // CHANGE_SLEEK_SLATE' : 'Core Laser Hue // CHANGE_COBALT_GLOW',
      category: 'THEME',
      action: onToggleAlternateTheme,
      icon: <Eye size={12} />
    },
    {
      id: 'toggle-drone',
      title: isDroneView ? 'Deactivate Overhead Drone View // PERSPECTIVE' : 'Activate Overhead Drone View // ORTHOGRAPHIC',
      category: 'CAMERA',
      action: onToggleDroneView,
      icon: <Camera size={12} />
    },
    {
      id: 'toggle-konami',
      title: isKonamiActive ? 'Deactivate Cyber Glow Override' : 'Trigger Retro Cyber Glow Override',
      category: 'SECRET',
      action: onToggleKonami,
      icon: <Sparkles size={12} />
    },
    {
      id: 'secret-panel',
      title: 'Unlock Diagnostics Core Panel // VIEW_BLUEPRINTS',
      category: 'SECRET',
      action: onOpenSecretPanel,
      icon: <ShieldAlert size={12} />
    },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(filterText.toLowerCase()) ||
    cmd.category.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleCommandSelect = (cmd: typeof commands[0]) => {
    sound.playConfirm();
    cmd.action();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-start justify-center pt-[15vh] px-4">
        <motion.div
          ref={paletteRef}
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-lg border border-white/15 bg-black/95 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-mono text-xs text-white/80"
        >
          {/* Header Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/2">
            <Terminal size={14} className="text-white/45 animate-pulse" />
            <input
              ref={inputRef}
              type="text"
              placeholder="SEARCH HELIOS CONTROLS (e.g. Nav, Mute, Secret, Theme)..."
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                sound.playTick();
              }}
              className="flex-1 bg-transparent border-none outline-none text-white text-xs py-0.5 placeholder-white/30"
            />
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Commands List */}
          <div className="max-h-72 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredCommands.length > 0 ? (
              filteredCommands.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => handleCommandSelect(cmd)}
                  className="w-full text-left px-3 py-2.5 hover:bg-white/10 border border-transparent hover:border-white/5 rounded-xl flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 group-hover:text-white transition-colors">
                      {cmd.icon}
                    </span>
                    <span className="group-hover:text-white transition-colors">
                      {cmd.title}
                    </span>
                  </div>
                  <span className="text-[8px] border border-white/10 text-white/40 px-1.5 py-0.5 rounded uppercase">
                    {cmd.category}
                  </span>
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-white/30 flex flex-col items-center gap-2">
                <Sliders size={20} className="text-white/20 animate-bounce" />
                <span>NO PROTOCOLS COMPLY WITH THE QUERY STRING</span>
              </div>
            )}
          </div>

          {/* Quick-tips bottom banner */}
          <div className="h-8 border-t border-white/5 bg-white/1 px-4 flex items-center justify-between text-[8px] text-white/25 select-none">
            <span>USE MOUSE CURSOR TO CHOOSE OPTIONS</span>
            <span>PRESS ESCAPE TO DEACTIVATE TERMINAL</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
