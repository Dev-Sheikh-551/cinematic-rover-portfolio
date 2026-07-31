/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Theme & Visitor Preference Store with LocalStorage Experience Memory
 */

export type EnvironmentTheme = 'midnight' | 'arctic' | 'graphite' | 'aurora' | 'sandstone' | 'blueprint';
export type RoverFinish = 'white' | 'matte-black' | 'titanium' | 'silver' | 'orange' | 'electric-blue';
export type RoadAccent = 'white' | 'cyan' | 'amber' | 'purple' | 'soft-blue';
export type InterfaceAccent = 'emerald' | 'cyan' | 'purple' | 'amber' | 'white';
export type CameraMode = 'drone' | 'follow' | 'isometric';
export type AmbientSoundPreset = 'silent' | 'minimal-synth' | 'space-ambience';
export type MotionPreset = 'full' | 'reduced' | 'minimal';

export interface ThemeState {
  environment: EnvironmentTheme;
  roverFinish: RoverFinish;
  roadAccent: RoadAccent;
  interfaceAccent: InterfaceAccent;
  cameraMode: CameraMode;
  ambientSound: AmbientSoundPreset;
  ambientVolume: number;
  motorVolume: number;
  sfxVolume: number;
  developerMode: boolean;
  reducedMotion: boolean;
  motionPreset: MotionPreset;
  unlockedAchievements: string[];
  visitedSections: Set<string>;
  inspectedProjects: Set<string>;
}

const STORAGE_KEY = 'rover_portfolio_preferences_v2';

export const ENVIRONMENT_CONFIGS: Record<EnvironmentTheme, {
  name: string;
  bgGradient: [string, string];
  fogColor: string;
  gridColor: string;
  skyGlow: string;
  particleColor: string;
  canvasClear: string;
}> = {
  midnight: {
    name: 'Midnight Black',
    bgGradient: ['#050508', '#0a0a12'],
    fogColor: '#050508',
    gridColor: 'rgba(255, 255, 255, 0.07)',
    skyGlow: 'rgba(255, 255, 255, 0.05)',
    particleColor: 'rgba(255, 255, 255, 0.4)',
    canvasClear: '#050508',
  },
  arctic: {
    name: 'Arctic White',
    bgGradient: ['#0f172a', '#1e293b'],
    fogColor: '#0f172a',
    gridColor: 'rgba(226, 232, 240, 0.12)',
    skyGlow: 'rgba(148, 163, 184, 0.15)',
    particleColor: 'rgba(241, 245, 249, 0.6)',
    canvasClear: '#0f172a',
  },
  graphite: {
    name: 'Graphite',
    bgGradient: ['#0d0e12', '#161820'],
    fogColor: '#0d0e12',
    gridColor: 'rgba(255, 255, 255, 0.08)',
    skyGlow: 'rgba(255, 255, 255, 0.06)',
    particleColor: 'rgba(200, 205, 215, 0.4)',
    canvasClear: '#0d0e12',
  },
  aurora: {
    name: 'Aurora',
    bgGradient: ['#040d1a', '#0a192f'],
    fogColor: '#040d1a',
    gridColor: 'rgba(56, 189, 248, 0.12)',
    skyGlow: 'rgba(168, 85, 247, 0.15)',
    particleColor: 'rgba(56, 189, 248, 0.5)',
    canvasClear: '#040d1a',
  },
  sandstone: {
    name: 'Sandstone',
    bgGradient: ['#120c08', '#1c140d'],
    fogColor: '#120c08',
    gridColor: 'rgba(245, 158, 11, 0.1)',
    skyGlow: 'rgba(217, 119, 6, 0.12)',
    particleColor: 'rgba(251, 191, 36, 0.5)',
    canvasClear: '#120c08',
  },
  blueprint: {
    name: 'Blueprint',
    bgGradient: ['#021024', '#052659'],
    fogColor: '#021024',
    gridColor: 'rgba(125, 211, 252, 0.15)',
    skyGlow: 'rgba(14, 165, 233, 0.18)',
    particleColor: 'rgba(186, 230, 253, 0.6)',
    canvasClear: '#021024',
  },
};

export const ROVER_FINISH_CONFIGS: Record<RoverFinish, {
  name: string;
  bodyColor: string;
  specular: string;
  accent: string;
}> = {
  white: {
    name: 'Pure White',
    bodyColor: '#f8fafc',
    specular: '#ffffff',
    accent: '#10b981',
  },
  'matte-black': {
    name: 'Matte Black',
    bodyColor: '#1e1e24',
    specular: '#3f3f46',
    accent: '#10b981',
  },
  titanium: {
    name: 'Titanium Gunmetal',
    bodyColor: '#475569',
    specular: '#94a3b8',
    accent: '#38bdf8',
  },
  silver: {
    name: 'Polished Silver',
    bodyColor: '#cbd5e1',
    specular: '#ffffff',
    accent: '#818cf8',
  },
  orange: {
    name: 'Mars Orange',
    bodyColor: '#ea580c',
    specular: '#fdba74',
    accent: '#facc15',
  },
  'electric-blue': {
    name: 'Electric Blue',
    bodyColor: '#0284c7',
    specular: '#7dd3fc',
    accent: '#a855f7',
  },
};

export const ROAD_ACCENT_CONFIGS: Record<RoadAccent, {
  name: string;
  lineColor: string;
  glowColor: string;
}> = {
  white: {
    name: 'Crisp White',
    lineColor: 'rgba(255, 255, 255, 0.85)',
    glowColor: 'rgba(255, 255, 255, 0.25)',
  },
  cyan: {
    name: 'Neon Cyan',
    lineColor: 'rgba(56, 189, 248, 0.9)',
    glowColor: 'rgba(56, 189, 248, 0.35)',
  },
  amber: {
    name: 'Amber Gold',
    lineColor: 'rgba(245, 158, 11, 0.9)',
    glowColor: 'rgba(245, 158, 11, 0.35)',
  },
  purple: {
    name: 'Cyber Purple',
    lineColor: 'rgba(168, 85, 247, 0.9)',
    glowColor: 'rgba(168, 85, 247, 0.35)',
  },
  'soft-blue': {
    name: 'Soft Sapphire',
    lineColor: 'rgba(99, 102, 241, 0.9)',
    glowColor: 'rgba(99, 102, 241, 0.35)',
  },
};

export const INTERFACE_ACCENT_CONFIGS: Record<InterfaceAccent, {
  name: string;
  hex: string;
  glow: string;
}> = {
  emerald: {
    name: 'Emerald Green',
    hex: '#10b981',
    glow: 'rgba(16, 185, 129, 0.3)',
  },
  cyan: {
    name: 'Cyan Blue',
    hex: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.3)',
  },
  purple: {
    name: 'Vibrant Purple',
    hex: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.3)',
  },
  amber: {
    name: 'Solar Amber',
    hex: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  white: {
    name: 'Monochrome White',
    hex: '#ffffff',
    glow: 'rgba(255, 255, 255, 0.3)',
  },
};

class ThemeStore {
  private state: ThemeState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadSavedState();
  }

  private loadSavedState(): ThemeState {
    const defaultState: ThemeState = {
      environment: 'midnight',
      roverFinish: 'white',
      roadAccent: 'cyan',
      interfaceAccent: 'emerald',
      cameraMode: 'drone',
      ambientSound: 'silent',
      ambientVolume: 0.3,
      motorVolume: 0.2,
      sfxVolume: 0.4,
      developerMode: false,
      reducedMotion: false,
      motionPreset: 'full',
      unlockedAchievements: [],
      visitedSections: new Set<string>(),
      inspectedProjects: new Set<string>(),
    };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultState,
          ...parsed,
          visitedSections: new Set(parsed.visitedSections || []),
          inspectedProjects: new Set(parsed.inspectedProjects || []),
        };
      }
    } catch (e) {
      console.warn('Failed to load theme preferences from localStorage:', e);
    }

    return defaultState;
  }

  private saveState() {
    try {
      const toSave = {
        ...this.state,
        visitedSections: Array.from(this.state.visitedSections),
        inspectedProjects: Array.from(this.state.inspectedProjects),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save theme preferences to localStorage:', e);
    }
  }

  public getState(): ThemeState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.saveState();
    this.listeners.forEach((listener) => listener());
  }

  public setEnvironment(environment: EnvironmentTheme) {
    this.state.environment = environment;
    this.notify();
  }

  public setRoverFinish(roverFinish: RoverFinish) {
    this.state.roverFinish = roverFinish;
    this.notify();
  }

  public setRoadAccent(roadAccent: RoadAccent) {
    this.state.roadAccent = roadAccent;
    this.notify();
  }

  public setInterfaceAccent(interfaceAccent: InterfaceAccent) {
    this.state.interfaceAccent = interfaceAccent;
    this.notify();
  }

  public setCameraMode(cameraMode: CameraMode) {
    this.state.cameraMode = cameraMode;
    this.notify();
  }

  public setAmbientSound(ambientSound: AmbientSoundPreset) {
    this.state.ambientSound = ambientSound;
    this.notify();
  }

  public setVolumes(ambient?: number, motor?: number, sfx?: number) {
    if (ambient !== undefined) this.state.ambientVolume = ambient;
    if (motor !== undefined) this.state.motorVolume = motor;
    if (sfx !== undefined) this.state.sfxVolume = sfx;
    this.notify();
  }

  public toggleDeveloperMode() {
    this.state.developerMode = !this.state.developerMode;
    this.notify();
  }

  public toggleReducedMotion() {
    const nextPreset: MotionPreset = this.state.motionPreset === 'full' ? 'reduced' : 'full';
    this.setMotionPreset(nextPreset);
  }

  public setMotionPreset(preset: MotionPreset) {
    this.state.motionPreset = preset;
    this.state.reducedMotion = preset !== 'full';
    this.notify();
  }

  public trackVisitedSection(section: string): string | null {
    if (this.state.visitedSections.has(section)) return null;
    this.state.visitedSections.add(section);
    
    // Check if all 6 core sections visited
    const allSections = ['hero', 'about', 'skills', 'projects', 'timeline', 'contact'];
    const isExplorerComplete = allSections.every(s => this.state.visitedSections.has(s));
    
    if (isExplorerComplete && !this.state.unlockedAchievements.includes('Explorer')) {
      this.unlockAchievement('Explorer');
      this.notify();
      return 'Explorer';
    }
    
    this.notify();
    return null;
  }

  public trackInspectedProject(projectId: string, totalProjectsCount: number): string | null {
    if (this.state.inspectedProjects.has(projectId)) return null;
    this.state.inspectedProjects.add(projectId);

    if (this.state.inspectedProjects.size >= totalProjectsCount && !this.state.unlockedAchievements.includes('Curator')) {
      this.unlockAchievement('Curator');
      this.notify();
      return 'Curator';
    }

    this.notify();
    return null;
  }

  public resetToDefaults() {
    // Preserve non-visual progress data
    const { unlockedAchievements, visitedSections, inspectedProjects } = this.state;
    this.state = {
      environment: 'midnight',
      roverFinish: 'white',
      roadAccent: 'cyan',
      interfaceAccent: 'emerald',
      cameraMode: 'drone',
      ambientSound: 'silent',
      ambientVolume: 0.3,
      motorVolume: 0.2,
      sfxVolume: 0.4,
      developerMode: false,
      reducedMotion: false,
      motionPreset: 'full',
      unlockedAchievements,
      visitedSections,
      inspectedProjects,
    };
    this.notify();
  }

  public unlockAchievement(id: string) {
    if (!this.state.unlockedAchievements.includes(id)) {
      this.state.unlockedAchievements.push(id);
      this.notify();
    }
  }
}

export const themeStore = new ThemeStore();
