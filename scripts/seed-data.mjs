import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

function getEnvOrThrow(primary, fallbacks = []) {
  const keys = [primary, ...fallbacks];
  for (const key of keys) {
    const value = process.env[key];
    if (value) return value;
  }
  throw new Error(`Missing required env var. Set one of: ${keys.join(', ')}`);
}

const SUPABASE_URL = getEnvOrThrow('SUPABASE_URL', ['NEXT_PUBLIC_SUPABASE_URL']);
const SUPABASE_SERVICE_ROLE_KEY = getEnvOrThrow('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seedCompleteData() {
  try {
    console.log('--- Seeding Complete Pipeline (Users -> Guardians -> Dogs) ---');

    const realUserId = getEnvOrThrow('SEED_USER_ID');
    const seedEmail = process.env.SEED_USER_EMAIL ?? `seed-${realUserId}@example.local`;
    const seedDogId = process.env.SEED_DOG_ID ?? randomUUID();

    // 1. Seed public.users first
    const { error: uErr } = await supabase.from('users').upsert([
      { id: realUserId, email: seedEmail }
    ]);

    if (uErr) {
        console.error('Users seed error:', uErr.message);
        return;
    }
    console.log('User seeded in public.users.');

    // 2. Seed guardians
    const { error: gErr } = await supabase.from('guardians').upsert([
      { 
        id: realUserId, 
        user_id: realUserId, 
        nickname: '댕대디(테스트)', 
        full_name: '테스트 유저',
        verified_region: true,
        onboarding_progress: 100,
        usage_purpose: ['friend']
      }
    ]);

    if (gErr) {
        console.error('Guardians seed error:', gErr.message);
        return;
    }
    console.log('Guardian seeded.');

    // 3. Seed dogs
    const { error: dErr } = await supabase.from('dogs').upsert([
      {
        id: seedDogId,
        guardian_id: realUserId,
        name: '초코',
        breed: '골든 리트리버',
        age: 3,
        weight_kg: 25.5,
        gender: 'male',
        neutered: true,
        photo_urls: ['https://images.unsplash.com/photo-1552053831-71594a27632d']
      }
    ]);

    if (dErr) console.error('Dogs seed error:', dErr.message);
    else console.log('Dogs seeded successfully. Wave 3 Ready!');

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

seedCompleteData();
