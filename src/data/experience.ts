/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Centralized Professional Experience Data Source
 */

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  position: string;
  status: string;
  period: string;
  location: string;
  description: string;
  technologies: string[];
  current?: boolean;
}

export const experienceData: ExperienceItem[] = [
  {
    id: 'exp-oceannet',
    company: 'OceanNet Technologies',
    role: 'Frontend Development Intern',
    position: 'Frontend Development Intern',
    status: 'Current (Third month / Ongoing)',
    period: '2026 – Present',
    location: 'The Gambia',
    description:
      'Working as a Frontend Development Intern, contributing to production web applications while transitioning from structured frontend training into professional software development and expanding into modern full-stack concepts.',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'JavaScript', 'HTML/CSS'],
    current: true,
  },
];
