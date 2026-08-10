/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Centralized Education & Training Data Source
 */

export interface EducationItem {
  id: string;
  institution: string;
  program: string;
  location?: string;
  period: string;
  status: 'Completed' | 'Ongoing';
  description: string;
  technologies?: string[];
}

export const educationData: EducationItem[] = [
  {
    id: 'edu-jcc',
    institution: 'Jasseh Code Camp (JCC)',
    program: 'Frontend Development',
    location: 'Serekunda, The Gambia',
    period: 'October 2024 – January 2026',
    status: 'Completed',
    description:
      'Completed the frontend development program, receiving training in HTML, CSS, JavaScript, React, TypeScript, and Tailwind CSS.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    id: 'edu-fcc',
    institution: 'freeCodeCamp',
    program: 'JavaScript & Web Development',
    period: 'Ongoing',
    status: 'Ongoing',
    description:
      'Self-directed learning in JavaScript algorithms, data structures, and core web development concepts.',
    technologies: ['JavaScript ES6+', 'Algorithms', 'Web Standards'],
  },
  {
    id: 'edu-scrimba',
    institution: 'Scrimba',
    program: 'React & Frontend Development',
    period: 'Ongoing',
    status: 'Ongoing',
    description:
      'Interactive self-study focusing on modern React component patterns, state architecture, and interactive web apps.',
    technologies: ['React', 'JSX', 'State Architecture'],
  },
];
