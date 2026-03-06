import { createClient } from '@supabase/supabase-js';

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

async function checkDatabase() {
  try {
    console.log('--- Checking Database Status (with service_role) ---');

    // 1. Check Guardians
    const { data: guardians, error: gError, count: gCount } = await supabase
      .from('guardians')
      .select('*', { count: 'exact' });

    if (gError) {
      console.error('Error fetching guardians:', gError.message);
    } else {
      console.log(`Guardians: ${gCount} records found.`);
      if (guardians && guardians.length > 0) {
        console.log('Latest Guardians (top 3):');
        guardians.slice(0, 3).forEach(g => console.log(`- ${g.nickname || g.id} (Owner: ${g.id})`));
      }
    }

    // 2. Check Dogs
    const { data: dogs, error: dError, count: dCount } = await supabase
      .from('dogs')
      .select('*', { count: 'exact' });

    if (dError) {
      console.error('Error fetching dogs:', dError.message);
    } else {
      console.log(`\nDogs: ${dCount} records found.`);
      if (dogs && dogs.length > 0) {
        console.log('Sample Dogs (top 3):');
        dogs.slice(0, 3).forEach(d => console.log(`- ${d.name} [${d.breed}] (Guardian: ${d.guardian_id})`));
      }
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkDatabase();
