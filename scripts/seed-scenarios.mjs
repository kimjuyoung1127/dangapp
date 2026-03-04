import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fjpvtivpulreulfxmxfe.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqcHZ0aXZwdWxyZXVsZnhteGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI2OTM3MiwiZXhwIjoyMDg3ODQ1MzcyfQ.a-g30QnbPw_LyLssPKNQqb7Z-zMZ9v2rBH4WT1lvAXA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedScenarios() {
  console.log('🚀 Starting Scenario-based Seeding...');

  const myUserId = 'a8b73aa4-8bbb-427f-af79-1a3dccec944e';
  await supabase.rpc('set_guardian_location', {
    p_guardian_id: myUserId,
    p_lng: 126.9780,
    p_lat: 37.5665
  });
  console.log('✅ My location set to Seoul City Hall.');

  const scenarios = [
    {
      id: '00000000-0000-0000-0000-000000000011',
      email: 'perfect@test.com',
      nickname: '우주아빠',
      lng: 126.9790, lat: 37.5670, // 100m
      activity: ['morning', 'evening'],
      trust: 95,
      dog: { name: '우주', breed: '골든 리트리버', age: 2, gender: 'male', temp: ['온순함', '활동적'] }
    },
    {
      id: '00000000-0000-0000-0000-000000000022',
      email: 'time@test.com',
      nickname: '루피언니',
      lng: 126.9900, lat: 37.5700, // ~1.5km
      activity: ['afternoon'],
      trust: 80,
      dog: { name: '루피', breed: '비숑 프라제', age: 4, gender: 'female', temp: ['겁이많음', '사교적'] }
    },
    {
      id: '00000000-0000-0000-0000-000000000033',
      email: 'far@test.com',
      nickname: '먼동네친구',
      lng: 127.0200, lat: 37.5800, // ~4.5km
      activity: ['morning'],
      trust: 50,
      dog: { name: '먼지', breed: '포메라니안', age: 1, gender: 'female', temp: ['활발함'] }
    },
    {
      id: '00000000-0000-0000-0000-000000000044',
      email: 'multidog@test.com',
      nickname: '다둥이네',
      lng: 126.9700, lat: 37.5600, // Very close
      activity: ['evening'],
      trust: 99,
      dogs: [
        { name: '초코', breed: '푸들', age: 5, gender: 'male', is_main: true },
        { name: '쿠키', breed: '푸들', age: 3, gender: 'female', is_main: false }
      ]
    }
  ];

  for (const s of scenarios) {
    try {
      const { data: authUser, error: aErr } = await supabase.auth.admin.createUser({
        id: s.id,
        email: s.email,
        password: 'password123',
        email_confirm: true
      });
      if (aErr && aErr.message !== 'User already exists') {
        console.warn(`Auth creation note: ${aErr.message}`);
      }

      await supabase.from('users').upsert({
        id: s.id,
        email: s.email,
        trust_score: s.trust,
        trust_level: Math.ceil(s.trust / 20)
      });

      await supabase.from('guardians').upsert({
        id: s.id,
        user_id: s.id,
        nickname: s.nickname,
        address_name: '서울시 중구',
        activity_times: s.activity,
        onboarding_progress: 100,
        verified_region: true
      });

      await supabase.rpc('set_guardian_location', {
        p_guardian_id: s.id,
        p_lng: s.lng,
        p_lat: s.lat
      });

      const dogList = s.dogs || [s.dog];
      for (const d of dogList) {
        await supabase.from('dogs').upsert({
          guardian_id: s.id,
          name: d.name,
          breed: d.breed,
          age: d.age,
          gender: d.gender,
          temperament: d.temp || [],
          is_main_dog: d.is_main || false
        });
      }

      console.log(`✅ Seeded: ${s.nickname}`);
    } catch (err) {
      console.error(`❌ Error ${s.nickname}:`, err.message);
    }
  }

  console.log('\n✨ All scenarios seeded successfully. Ready for UI debugging!');
}

seedScenarios();
