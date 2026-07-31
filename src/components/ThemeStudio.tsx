/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Theme Studio — Apple Liquid Glass Visitor Customization Panel
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  X,
  Palette,
  Camera,
  Volume2,
  Sliders,
  Check,
  Shield,
  Sparkles,
  VolumeX,
  Terminal,
  Activity,
  RotateCcw
} from 'lucide-react';
import { LiquidGlass } from './LiquidGlass';
import {
  themeStore,
  EnvironmentTheme,
  RoverFinish,
  RoadAccent,
  InterfaceAccent,
  CameraMode,
  AmbientSoundPreset,
  ENVIRONMENT_CONFIGS,
  ROVER_FINISH_CONFIGS,
  ROAD_ACCENT_CONFIGS,
  INTERFACE_ACCENT_CONFIGS,
} from '../themeStore';
import { sound } from './SoundManager';

type TabType = 'appearance' | 'camera' | 'audio' | 'experience';

export const ThemeStudio: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('appearance');
  const [themeState, setThemeState] = useState({ ...themeStore.getState() });

  useEffect(() => {
    const unsubscribe = themeStore.subscribe(() => {
      // Spread into a new object so React detects the change and re-renders immediately
      setThemeState({ ...themeStore.getState() });
    });
    return unsubscribe;
  }, []);

  const [resetConfirm, setResetConfirm] = useState(false);

  const handleToggleOpen = () => {
    sound.playConfirm();
    setIsOpen(!isOpen);
  };

  const handleReset = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      // Auto-cancel confirmation after 3s
      setTimeout(() => setResetConfirm(false), 3000);
      return;
    }
    themeStore.resetToDefaults();
    sound.playConfirm();
    setResetConfirm(false);
  };

  return (
    <>
      {/* FLOATING SETTINGS TRIGGER BUTTON */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <button
          onClick={handleToggleOpen}
          className="group relative p-3.5 rounded-full backdrop-blur-xl border border-white/20 bg-black/40 text-white shadow-2xl hover:border-white/40 hover:bg-black/60 transition-all duration-300 cursor-pointer"
          title="Open Theme Studio"
          aria-label="Open Theme Studio"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <Settings size={18} className="transition-transform duration-500 group-hover:rotate-90 text-white/90" />
        </button>
      </motion.div>

      {/* LIQUID GLASS THEME STUDIO DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-4 md:p-6 pointer-events-none">
            {/* Backdrop Dismiss */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleToggleOpen}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            />

            {/* Main Liquid Glass Drawer */}
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md pointer-events-auto max-h-[85vh] flex flex-col"
            >
              <LiquidGlass
                radius="1.75rem"
                distortion={10}
                blur={20}
                tint={0.12}
                interactive={false}
                contentClassName="h-full flex flex-col min-h-0 overflow-hidden"
                className="p-5 md:p-6 shadow-2xl overflow-hidden flex flex-col h-full border border-white/20"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 flex-shrink-0">
                  <div className="flex items-center gap-2 font-mono text-xs text-white">
                    <Sparkles size={14} className="text-emerald-400" />
                    <span className="font-bold tracking-wider uppercase text-sm">Theme Studio</span>
                    <span className="text-[10px] text-white/40 font-normal">v2.0</span>
                  </div>
                  <button
                    onClick={handleToggleOpen}
                    className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* 4 TAB NAVIGATION BUTTONS */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-white/5 rounded-xl border border-white/10 mb-4 font-mono text-[10px] flex-shrink-0">
                  <button
                    onClick={() => { setActiveTab('appearance'); sound.playTick(); }}
                    className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'appearance'
                        ? 'bg-white/15 border border-white/20 text-white font-medium shadow'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <Palette size={13} />
                    <span>Style</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('camera'); sound.playTick(); }}
                    className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'camera'
                        ? 'bg-white/15 border border-white/20 text-white font-medium shadow'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <Camera size={13} />
                    <span>Camera</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('audio'); sound.playTick(); }}
                    className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'audio'
                        ? 'bg-white/15 border border-white/20 text-white font-medium shadow'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <Volume2 size={13} />
                    <span>Audio</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('experience'); sound.playTick(); }}
                    className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'experience'
                        ? 'bg-white/15 border border-white/20 text-white font-medium shadow'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <Sliders size={13} />
                    <span>System</span>
                  </button>
                </div>

                {/* TAB CONTENT CONTAINER (Smooth Vertical Scroll) */}
                <div className="overflow-y-auto space-y-5 pr-2 flex-1 min-h-0 text-xs custom-scrollbar">
                  {/* TAB 1: APPEARANCE */}
                  {activeTab === 'appearance' && (
                    <div className="space-y-5">
                      {/* Environment Theme */}
                      <div>
                        <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-2">
                          Environment Preset
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {(Object.keys(ENVIRONMENT_CONFIGS) as EnvironmentTheme[]).map((env) => {
                            const config = ENVIRONMENT_CONFIGS[env];
                            const isSelected = themeState.environment === env;
                            return (
                              <button
                                key={env}
                                onClick={() => {
                                  themeStore.setEnvironment(env);
                                  sound.playConfirm();
                                }}
                                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-emerald-400 bg-emerald-400/10 text-white font-medium'
                                    : 'border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:text-white'
                                }`}
                              >
                                <span className="font-mono text-[11px]">{config.name}</span>
                                {isSelected && <Check size={12} className="text-emerald-400" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Rover Finish */}
                      <div>
                        <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-2">
                          Rover Material Finish
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {(Object.keys(ROVER_FINISH_CONFIGS) as RoverFinish[]).map((finish) => {
                            const config = ROVER_FINISH_CONFIGS[finish];
                            const isSelected = themeState.roverFinish === finish;
                            return (
                              <button
                                key={finish}
                                onClick={() => {
                                  themeStore.setRoverFinish(finish);
                                  sound.playConfirm();
                                }}
                                className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                                  isSelected
                                    ? 'border-emerald-400 bg-white/10 text-white'
                                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/25'
                                }`}
                              >
                                <span
                                  className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                                  style={{ backgroundColor: config.bodyColor }}
                                />
                                <span className="font-mono text-[10px] truncate w-full">{config.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Road Accent */}
                      <div>
                        <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-2">
                          Illuminated Road Color
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(ROAD_ACCENT_CONFIGS) as RoadAccent[]).map((accent) => {
                            const config = ROAD_ACCENT_CONFIGS[accent];
                            const isSelected = themeState.roadAccent === accent;
                            return (
                              <button
                                key={accent}
                                onClick={() => {
                                  themeStore.setRoadAccent(accent);
                                  sound.playConfirm();
                                }}
                                style={{
                                  borderColor: isSelected ? config.lineColor : undefined,
                                  boxShadow: isSelected ? `0 0 10px ${config.glowColor}` : undefined,
                                }}
                                className={`px-3 py-1.5 rounded-full border font-mono text-[10px] transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-white/15 text-white font-semibold'
                                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white'
                                }`}
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-white/20"
                                  style={{ backgroundColor: config.lineColor, boxShadow: `0 0 6px ${config.glowColor}` }}
                                />
                                <span>{config.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Interface Accent */}
                      <div>
                        <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-2">
                          Interface Highlight Accent
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(INTERFACE_ACCENT_CONFIGS) as InterfaceAccent[]).map((accent) => {
                            const config = INTERFACE_ACCENT_CONFIGS[accent];
                            const isSelected = themeState.interfaceAccent === accent;
                            return (
                              <button
                                key={accent}
                                onClick={() => {
                                  themeStore.setInterfaceAccent(accent);
                                  sound.playConfirm();
                                }}
                                className={`px-3 py-1 rounded-full border font-mono text-[10px] transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'border-white bg-white/20 text-white font-medium'
                                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/25'
                                }`}
                              >
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.hex }} />
                                <span>{config.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CAMERA */}
                  {activeTab === 'camera' && (
                    <div className="space-y-3">
                      <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-2">
                        Perspective Mode
                      </div>
                      
                      {[
                        { id: 'drone' as CameraMode, title: 'Drone Mode (Default)', desc: 'High altitude orthographic cinematic top-down view.' },
                        { id: 'follow' as CameraMode, title: 'Follow Mode', desc: 'Stable chase camera positioned smoothly behind the rover.' },
                        { id: 'isometric' as CameraMode, title: 'Isometric 3D View', desc: 'Angled 45° perspective showing both vehicle and path.' },
                      ].map((cam) => {
                        const isSelected = themeState.cameraMode === cam.id;
                        return (
                          <button
                            key={cam.id}
                            onClick={() => {
                              themeStore.setCameraMode(cam.id);
                              sound.playConfirm();
                            }}
                            className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                              isSelected
                                ? 'border-emerald-400 bg-emerald-400/10 text-white'
                                : 'border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:text-white'
                            }`}
                          >
                            <div>
                              <div className="font-mono text-xs font-bold text-white flex items-center gap-2">
                                <Camera size={12} className={isSelected ? 'text-emerald-400' : 'text-white/40'} />
                                <span>{cam.title}</span>
                              </div>
                              <div className="text-[11px] font-sans text-white/50 mt-1">{cam.desc}</div>
                            </div>
                            {isSelected && <Check size={14} className="text-emerald-400 mt-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* TAB 3: AUDIO */}
                  {activeTab === 'audio' && (
                    <div className="space-y-4">
                      <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-2">
                        Procedural Ambient Soundscape
                      </div>

                      <div className="space-y-2">
                        {[
                          { id: 'silent' as AmbientSoundPreset, title: 'Silent (Default)', desc: 'Pure silence' },
                          { id: 'minimal-synth' as AmbientSoundPreset, title: 'Minimal Synth', desc: 'Warm sub-harmonic analog drone pad' },
                          { id: 'space-ambience' as AmbientSoundPreset, title: 'Space Ambience', desc: 'Multitone harmonic space texture' },
                        ].map((soundItem) => {
                          const isSelected = themeState.ambientSound === soundItem.id;
                          return (
                            <button
                              key={soundItem.id}
                              onClick={() => {
                                themeStore.setAmbientSound(soundItem.id);
                                sound.setAmbientPreset(soundItem.id);
                                sound.playConfirm();
                              }}
                              className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'border-emerald-400 bg-emerald-400/10 text-white font-medium'
                                  : 'border-white/10 bg-white/5 text-white/70 hover:border-white/25'
                              }`}
                            >
                              <div className="font-mono text-[11px]">
                                <div className="text-white font-bold">{soundItem.title}</div>
                                <div className="text-[10px] text-white/40 font-normal">{soundItem.desc}</div>
                              </div>
                              {isSelected && <Check size={12} className="text-emerald-400" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Volume Sliders */}
                      <div className="pt-3 border-t border-white/10 space-y-3 font-mono text-[10px]">
                        <div>
                          <div className="flex justify-between text-white/60 mb-1">
                            <span>Ambient Volume</span>
                            <span>{Math.round(themeState.ambientVolume * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={themeState.ambientVolume}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              themeStore.setVolumes(val);
                              sound.setVolumes(val);
                            }}
                            className="w-full accent-emerald-400 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: SYSTEM & EXPERIENCE */}
                  {activeTab === 'experience' && (
                    <div className="space-y-4">
                      <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-2">
                        Experience Toggles
                      </div>

                      {/* Motion Preferences Section */}
                      <div className="space-y-2">
                        <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <Activity size={12} className="text-emerald-400" />
                          <span>Motion Preferences</span>
                        </div>

                        {[
                          { id: 'full' as const, title: 'Full Motion', desc: 'Full 3D camera orbits, ambient floating, and rich motion.' },
                          { id: 'reduced' as const, title: 'Reduced Motion', desc: 'Dampened camera, reduced floating, shorter transitions.' },
                          { id: 'minimal' as const, title: 'Minimal Motion', desc: 'Static camera, minimal transitions, essential motion only.' },
                        ].map((item) => {
                          const isSelected = (themeState.motionPreset || 'full') === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                themeStore.setMotionPreset(item.id);
                                sound.playConfirm();
                              }}
                              className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'border-emerald-400 bg-emerald-400/10 text-white font-medium'
                                  : 'border-white/10 bg-white/5 text-white/70 hover:border-white/25'
                              }`}
                              aria-pressed={isSelected}
                            >
                              <div className="font-mono text-[11px]">
                                <div className="text-white font-bold">{item.title}</div>
                                <div className="text-[10px] text-white/40 font-normal">{item.desc}</div>
                              </div>
                              {isSelected && <Check size={12} className="text-emerald-400" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Developer Mode Toggle */}
                      <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                        <div>
                          <div className="font-mono text-xs font-bold text-white flex items-center gap-2">
                            <Terminal size={13} className="text-emerald-400" />
                            <span>Developer Overlay</span>
                          </div>
                          <div className="text-[10px] text-white/50 font-sans mt-0.5">
                            Show live FPS, draw calls, triangles & telemetry (Ctrl+Shift+D).
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            themeStore.toggleDeveloperMode();
                            sound.playConfirm();
                          }}
                          className={`w-10 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                            themeState.developerMode ? 'bg-emerald-500 justify-end' : 'bg-white/20 justify-start'
                          }`}
                          aria-label="Toggle Developer Mode"
                        >
                          <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                        </button>
                      </div>

                      {/* Exploration Badges Status */}
                      <div className="p-3 rounded-xl border border-white/10 bg-white/5 font-mono text-[10px] space-y-2">
                        <div className="text-white/60 flex items-center gap-1.5 uppercase font-bold">
                          <Shield size={11} className="text-emerald-400" />
                          <span>Exploration Status</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {['Explorer', 'Curator', 'Connection Established', 'Curious Mind', 'Story Complete'].map((badge) => {
                            const isUnlocked = themeState.unlockedAchievements.includes(badge);
                            return (
                              <span
                                key={badge}
                                className={`px-2 py-0.5 rounded border text-[9px] ${
                                  isUnlocked
                                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                                    : 'bg-white/5 border-white/10 text-white/30'
                                }`}
                              >
                                {badge} {isUnlocked ? '✓' : '🔒'}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer — Reset to Defaults */}
                <div className="flex-shrink-0 pt-4 mt-2 border-t border-white/10">
                  <button
                    onClick={handleReset}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl border font-mono text-[11px] transition-all duration-200 cursor-pointer ${
                      resetConfirm
                        ? 'bg-red-500/20 border-red-400/50 text-red-300 hover:bg-red-500/30'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
                    }`}
                  >
                    <RotateCcw size={11} className={resetConfirm ? 'text-red-300' : ''} />
                    <span>{resetConfirm ? 'Confirm Reset — Click again' : 'Reset to Defaults'}</span>
                  </button>
                </div>

              </LiquidGlass>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
