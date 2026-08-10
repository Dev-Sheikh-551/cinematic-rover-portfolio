/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Centralized Personal Data Source
 */

export interface PersonalData {
  name: string;
  title: string;
  specialization: string;
  location: string;
  email: string;
  phone: string;
  github: string;
  linkedin?: string;
  bioSummary: string;
  keyPhilosophy: string;
  storyNarrative: {
    paragraph1: string;
    paragraph2: string;
  };
}

export const personalData: PersonalData = {
  name: 'Sheikh Tijan Touray',
  title: 'Frontend Developer',
  specialization: 'Frontend Development / React',
  location: 'The Gambia',
  email: 'sheikhtijantouray551@gmail.com',
  phone: '+220 593 8108',
  github: 'https://github.com/Dev-Sheikh-551',
  linkedin: '', // Preserved empty as no verified LinkedIn URL exists in the project
  bioSummary:
    'I am a Frontend Developer from The Gambia focused on building responsive, interactive, and production-ready web applications. My development journey began at Jasseh Code Camp, where I learned the foundations of modern frontend development with JavaScript, React, TypeScript, and Tailwind CSS. I have since continued learning independently through platforms such as freeCodeCamp and Scrimba while building practical projects and gaining professional experience through my current frontend internship at OceanNet Technologies.',
  keyPhilosophy:
    'I believe the best way to learn software engineering is by building real products, solving real problems, and continuously improving every version.',
  storyNarrative: {
    paragraph1:
      'I am a frontend developer focused on creating fast, polished, and responsive web applications. In October 2024, I joined Jasseh Code Camp (JCC), developing a strong foundation in JavaScript, React, TypeScript, and Tailwind CSS.',
    paragraph2:
      'Rather than just following tutorials, I learn by building real products and deepening my knowledge through self-study with freeCodeCamp and Scrimba. My focus is crafting refined digital experiences that combine thoughtful design, fluid interactions, and scalable engineering.',
  },
};
