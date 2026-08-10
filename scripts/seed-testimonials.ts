import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const INITIAL_TESTIMONIALS = [
  {
    name: 'Alieu Jallow',
    role: 'Senior Software Engineer',
    company: 'OceanNet Technologies',
    rating: 5,
    text: 'Sheikh demonstrated exceptional initiative and attention to detail during his internship. His ability to turn complex UI requirements into responsive, polished React applications is impressive.',
    isFeatured: true,
    status: 'APPROVED',
  },
  {
    name: 'Fatou Badjie',
    role: 'Product Designer',
    company: 'JCC Alum',
    rating: 5,
    text: 'Working alongside Sheikh at Jasseh Code Camp was a great experience. He brings a strong eye for design tokens, typography, and fluid micro-animations to every project.',
    isFeatured: true,
    status: 'APPROVED',
  },
  {
    name: 'Lamin Sanyang',
    role: 'Lead Developer',
    company: 'TechGambia',
    rating: 5,
    text: 'Sheikh has a remarkable passion for full-stack engineering. His dedication to learning backend architecture with Express, PostgreSQL, and Prisma sets him apart as a fast learner.',
    isFeatured: true,
    status: 'APPROVED',
  },
  {
    name: 'Mariama Touray',
    role: 'Frontend Architect',
    company: 'Freelance',
    rating: 5,
    text: 'A brilliant junior developer with a deep appreciation for web performance, modern state management, and user experience aesthetics.',
    isFeatured: false,
    status: 'APPROVED',
  },
];

async function seed() {
  console.log('Seeding initial approved testimonials into Supabase PostgreSQL...');

  for (const t of INITIAL_TESTIMONIALS) {
    try {
      await pool.query(
        `INSERT INTO "public"."testimonials" ("id", "name", "role", "company", "rating", "text", "status", "isFeatured", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6::"TestimonialStatus", $7, NOW(), NOW())
         ON CONFLICT DO NOTHING;`,
        [t.name, t.role, t.company, t.rating, t.text, t.status, t.isFeatured]
      );
      console.log(`✓ Seeded testimonial from: ${t.name}`);
    } catch (err: any) {
      console.error(`✕ Error seeding ${t.name}:`, err.message);
    }
  }

  console.log('\nTestimonials seeding complete!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
