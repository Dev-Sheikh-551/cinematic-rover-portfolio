/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Centralized Technical Skills Data Source
 */

export interface SkillCategory {
  id: string;
  label: string;
  color: string;
  glowColor: string;
  dotColor: string;
  skills: { name: string; level: number }[];
}

export const skillsData: SkillCategory[] = [
  {
    id: 'frontend',
    label: 'Frontend Core',
    color: 'rgba(56, 189, 248, 0.7)',
    glowColor: 'rgba(56, 189, 248, 0.25)',
    dotColor: 'bg-sky-400',
    skills: [
      { name: 'React', level: 90 },
      { name: 'TypeScript', level: 50 },
      { name: 'JavaScript ES6+', level: 75 },
      { name: 'Tailwind CSS', level: 95 },
      { name: 'HTML5 & CSS3', level: 98 },
      { name: 'React Router', level: 85 },
      { name: 'Vite', level: 90 },
    ],
  },
  {
    id: 'fullstack',
    label: 'Full-Stack & Backend',
    color: 'rgba(52, 211, 153, 0.7)',
    glowColor: 'rgba(52, 211, 153, 0.25)',
    dotColor: 'bg-emerald-400',
    skills: [
      { name: 'Next.js', level: 50 },
      { name: 'Node.js', level: 50 },
      { name: 'Express', level: 15 },
      { name: 'PostgreSQL', level: 60 },
      { name: 'Prisma ORM', level: 78 },
      { name: 'Zod', level: 45 },
      { name: 'Auth.js', level: 74 },
    ],
  },
  {
    id: 'tooling',
    label: 'Tooling & Ecosystem',
    color: 'rgba(168, 85, 247, 0.7)',
    glowColor: 'rgba(168, 85, 247, 0.25)',
    dotColor: 'bg-purple-400',
    skills: [
      { name: 'Git & GitHub', level: 88 },
      { name: 'Zustand', level: 46 },
      { name: 'Docker', level: 20 },
      { name: 'Vercel', level: 90 },
    ],
  },
];
