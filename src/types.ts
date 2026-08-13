/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScrollStage = 'hero' | 'about' | 'skills' | 'projects' | 'timeline' | 'contact' | 'final';

export interface DeveloperNotes {
  architectureReason?: string;
  technicalChallenges?: string;
  optimizations?: string;
  lessonsLearned?: string;
  futureImprovements?: string;
  implementationDetail?: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  challenge?: string;
  solution?: string;
  result?: string;
  role: string;
  period: string;
  tech: string[];
  githubUrl: string;
  liveUrl?: string | null;
  demoUrl?: string | null;
  modelType: 'lander' | 'satellite' | 'drone' | 'radar';
  imageUrl?: string;
  images?: {
    desktop?: string;
    tablet?: string;
    mobile?: string;
  };
  featured?: boolean;
  architecture?: {
    challenge: string;
    solution: string;
    impact: string;
  };
  developerNotes?: DeveloperNotes;
}

export interface SkillNode {
  id: string;
  name: string;
  category: 'core' | 'frontend' | 'backend' | 'animation' | 'tooling' | 'statedata';
  level: number; // 0 to 100
  x: number;
  y: number;
  z: number;
  connections?: string[]; // IDs of connected skills for neural net
}

export interface TimelineEvent {
  id: string;
  chapterTitle: string;
  year: string;
  title: string;
  company: string;
  description: string;
  coordinates: { x: number; y: number; z: number };
}

export interface SoundConfig {
  muted: boolean;
  volume: number;
}
