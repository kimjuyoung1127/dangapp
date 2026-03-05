import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

function getEnvOrThrow(primary, fallbacks = []) {
  const keys = [primary, ...fallbacks];
  for (const key of keys) {
    const value = process.env[key];
    if (value) return value;
  }
  throw new Error(`Missing required env var. Set one of: ${keys.join(", ")}`);
}

async function loadEnvFallbacks() {
  const candidates = [".env.local", "frontend/.env.local", "frontend/.env.example"];
  for (const filePath of candidates) {
    if (!existsSync(filePath)) continue;
    const raw = await readFile(filePath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex <= 0) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

function assertNoError(error, step) {
  if (error) {
    throw new Error(`${step} failed: ${error.message}`);
  }
}

async function seedScenarios() {
  await loadEnvFallbacks();

  const supabaseUrl = getEnvOrThrow("SUPABASE_URL", ["NEXT_PUBLIC_SUPABASE_URL"]);
  const serviceRoleKey = getEnvOrThrow("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const primaryGuardianId = process.env.SEED_SCENARIO_PRIMARY_GUARDIAN_ID ?? null;

  const scenarios = [
    {
      id: "00000000-0000-0000-0000-000000000011",
      email: "scenario-perfect@example.local",
      nickname: "scenario-perfect",
      lng: 126.979,
      lat: 37.567,
      activity_times: ["morning", "evening"],
      trust_score: 95,
      dog: { name: "Buddy", breed: "Golden Retriever", age: 2, gender: "male" },
    },
    {
      id: "00000000-0000-0000-0000-000000000022",
      email: "scenario-time@example.local",
      nickname: "scenario-time",
      lng: 126.99,
      lat: 37.57,
      activity_times: ["afternoon"],
      trust_score: 80,
      dog: { name: "Lupi", breed: "Bichon Frise", age: 4, gender: "female" },
    },
    {
      id: "00000000-0000-0000-0000-000000000033",
      email: "scenario-far@example.local",
      nickname: "scenario-far",
      lng: 127.02,
      lat: 37.58,
      activity_times: ["morning"],
      trust_score: 50,
      dog: { name: "Mong", breed: "Pomeranian", age: 1, gender: "female" },
    },
  ];

  console.log("Scenario seed started.");

  for (const scenario of scenarios) {
    const { error: authErr } = await supabase.auth.admin.createUser({
      id: scenario.id,
      email: scenario.email,
      password: "password123",
      email_confirm: true,
    });
    if (authErr && !authErr.message.includes("already")) {
      throw new Error(`create auth user (${scenario.email}) failed: ${authErr.message}`);
    }

    const { error: userErr } = await supabase.from("users").upsert({
      id: scenario.id,
      email: scenario.email,
      trust_score: scenario.trust_score,
      trust_level: Math.max(1, Math.ceil(scenario.trust_score / 20)),
    });
    assertNoError(userErr, `upsert users (${scenario.email})`);

    const { error: guardianErr } = await supabase.from("guardians").upsert({
      id: scenario.id,
      user_id: scenario.id,
      nickname: scenario.nickname,
      address_name: "Seoul",
      activity_times: scenario.activity_times,
      onboarding_progress: 100,
      verified_region: true,
    });
    assertNoError(guardianErr, `upsert guardians (${scenario.nickname})`);

    const { error: dogErr } = await supabase.from("dogs").insert({
      guardian_id: scenario.id,
      name: scenario.dog.name,
      breed: scenario.dog.breed,
      age: scenario.dog.age,
      gender: scenario.dog.gender,
      temperament: ["friendly", "active"],
    });
    if (dogErr && !dogErr.message.includes("duplicate")) {
      throw new Error(`insert dog (${scenario.dog.name}) failed: ${dogErr.message}`);
    }

    const { error: locationErr } = await supabase.rpc("set_guardian_location", {
      p_guardian_id: scenario.id,
      p_lng: scenario.lng,
      p_lat: scenario.lat,
    });
    if (locationErr) {
      console.warn(`set_guardian_location warning (${scenario.nickname}): ${locationErr.message}`);
    }

    console.log(`- seeded ${scenario.nickname}`);
  }

  if (primaryGuardianId) {
    const { error: meLocErr } = await supabase.rpc("set_guardian_location", {
      p_guardian_id: primaryGuardianId,
      p_lng: 126.978,
      p_lat: 37.5665,
    });
    if (meLocErr) {
      console.warn(`primary location warning: ${meLocErr.message}`);
    } else {
      console.log(`- updated primary guardian location (${primaryGuardianId})`);
    }
  }

  console.log("Scenario seed completed.");
}

seedScenarios().catch((error) => {
  console.error("[seed-scenarios] failed:", error.message);
  process.exitCode = 1;
});
