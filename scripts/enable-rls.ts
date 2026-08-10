import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log('Enabling Row Level Security (RLS) on all Supabase public tables...');

  const tables = [
    'users',
    'accounts',
    'sessions',
    'verification_tokens',
    'contact_messages',
    'testimonials',
    'site_analytics',
  ];

  for (const table of tables) {
    try {
      await pool.query(`ALTER TABLE "public"."${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`✓ RLS enabled for table: ${table}`);
    } catch (err: any) {
      console.error(`✕ Error enabling RLS for ${table}:`, err.message);
    }
  }

  console.log('\nSupabase RLS enablement complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
