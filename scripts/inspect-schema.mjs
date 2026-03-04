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

async function inspectSchema() {
  try {
    console.log('--- Inspecting Table Schemas ---');

    // Fetch column names for guardians
    const { data: gCols, error: gErr } = await supabase
      .from('guardians')
      .select('*')
      .limit(1);

    if (gErr) console.error('Guardians error:', gErr.message);
    else console.log('Guardians Columns:', Object.keys(gCols[0] || {}));

    // Fetch column names for dogs
    const { data: dCols, error: dErr } = await supabase
      .from('dogs')
      .select('*')
      .limit(1);

    if (dErr) console.error('Dogs error:', dErr.message);
    else console.log('Dogs Columns:', Object.keys(dCols[0] || {}));

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

inspectSchema();
