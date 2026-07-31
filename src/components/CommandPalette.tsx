/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Actionable Command Palette (⌘K)
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, ShieldAlert, Volume2, VolumeX, Eye, Sparkles, Navigation, X, Camera, Palette, Sliders } from 'lucide-react';
import { sound } from './SoundManager';
import { themeStore, EnvironmentTheme, CameraMode } from '../themeStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [filterText, setFilterText] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      sound.playConfirm();
    }
  }, [isOpen]);

  const commands = [
    // NAVIGATION COMMANDS
    {
      id: 'go-hero',
      title: '> go hero (top)',
      category: 'NAVIGATION',
      action: () => onNavigate('hero'),
      icon: <Navigation size={12} />
    },
    {
      id: 'go-about',
      title: '> go about',
      category: 'NAVIGATION',
      action: () => onNavigate('about'),
      icon: <Navigation size={12} />
    },
    {
      id: 'go-skills',
      title: '> go skills',
      category: 'NAVIGATION',
      action: () => onNavigate('skills'),
      icon: <Navigation size={12} />
    },
    {
      id: 'go-projects',
      title: '> go projects',
      category: 'NAVIGATION',
      action: () => onNavigate('projects'),
      icon: <Navigation size={12} />
    },
    {
      id: 'go-timeline',
      title: '> go timeline (journey)',
      category: 'NAVIGATION',
      action: () => onNavigate('timeline'),
      icon: <Navigation size={12} />
    },
    {
      id: 'go-contact',
      title: '> go contact (bottom)',
      category: 'NAVIGATION',
      action: () => onNavigate('contact'),
      icon: <Navigation size={12} />
    },

    // THEME SWITCH COMMANDS
    {
      id: 'theme-midnight',
      title: '> switch theme midnight',
      category: 'THEME',
      action: () => themeStore.setEnvironment('midnight'),
      icon: <Palette size={12} />
    },
    {
      id: 'theme-arctic',
      title: '> switch theme arctic',
      category: 'THEME',
      action: () => themeStore.setEnvironment('arctic'),
      icon: <Palette size={12} />
    },
    {
      id: 'theme-graphite',
      title: '> switch theme graphite',
      category: 'THEME',
      action: () => themeStore.setEnvironment('graphite'),
      icon: <Palette size={12} />
    },
    {
      id: 'theme-aurora',
      title: '> switch theme aurora',
      category: 'THEME',
      action: () => themeStore.setEnvironment('aurora'),
      icon: <Palette size={12} />
    },

    // CAMERA COMMANDS
    {
      id: 'cam-drone',
      title: '> camera drone (overhead default)',
      category: 'CAMERA',
      action: () => themeStore.setCameraMode('drone'),
      icon: <Camera size={12} />
    },
    {
      id: 'cam-follow',
      title: '> camera follow (behind rover)',
      category: 'CAMERA',
      action: () => themeStore.setCameraMode('follow'),
      icon: <Camera size={12} />
    },
    {
      id: 'cam-isometric',
      title: '> camera isometric (3D angle)',
      category: 'CAMERA',
      action: () => themeStore.setCameraMode('isometric'),
      icon: <Camera size={12} />
    },

    // AUDIO & DEVELOPER MODE
    {
      id: 'toggle-audio',
      title: '> toggle audio (mute / unmute)',
      category: 'SYSTEM',
      action: () => {
        const isMuted = sound.isMuted();
        sound.setMuted(!isMuted);
      },
      icon: <Volume2 size={12} />
    },
    {
      id: 'developer-mode',
      title: '> developer mode (performance stats)',
      category: 'SYSTEM',
      action: () => themeStore.toggleDeveloperMode(),
      icon: <Sliders size={12} />
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
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-lg border border-white/15 bg-black/95 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-mono text-xs text-white/80"
        >
          {/* Header Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
            <Terminal size={14} className="text-emerald-400 animate-pulse" />
            <input
              ref={inputRef}
              type="text"
              placeholder="TYPE COMMAND (e.g. > go projects, > switch theme, > camera follow)..."
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                sound.playTick();
              }}
              className="flex-1 bg-transparent border-none outline-none text-white text-xs py-0.5 placeholder-white/30"
            />
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors cursor-pointer">
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
                  className="w-full text-left px-3 py-2.5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-xl flex items-center justify-between transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 group-hover:text-emerald-400 transition-colors">
                      {cmd.icon}
                    </span>
                    <span className="group-hover:text-white transition-colors font-mono">
                      {cmd.title}
                    </span>
                  </div>
                  <span className="text-[9px] text-white/30 group-hover:text-white/60 font-mono">
                    {cmd.category}
                  </span>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-white/40 text-xs">
                No matching system command found
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-white/10 bg-white/2 text-[9px] text-white/30 flex justify-between">
            <span>PRESS ESC TO CLOSE</span>
            <span>ACTIONABLE COMMAND SYSTEM</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
