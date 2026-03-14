import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

export const DEBUG_DEMO_IDS = {
  homeGuardianIds: [
    "00000000-0000-0000-0000-00000000d101",
    "00000000-0000-0000-0000-00000000d102",
    "00000000-0000-0000-0000-00000000d103",
  ],
  careGuardianId: "00000000-0000-0000-0000-00000000d201",
  familyGuardianId: "00000000-0000-0000-0000-00000000d301",
  carePlaceIds: [
    "00000000-0000-0000-0000-00000000c101",
    "00000000-0000-0000-0000-00000000c102",
  ],
  familyGroupIds: [
    "00000000-0000-0000-0000-00000000f101",
    "00000000-0000-0000-0000-00000000f102",
  ],
  familyScheduleIds: [
    "00000000-0000-0000-0000-00000000e101",
    "00000000-0000-0000-0000-00000000e102",
  ],
  roomIds: [
    "00000000-0000-0000-0000-00000000aa11",
    "00000000-0000-0000-0000-00000000aa12",
  ],
  dogIds: {
    home: [
      "00000000-0000-0000-0000-00000000b101",
      "00000000-0000-0000-0000-00000000b102",
      "00000000-0000-0000-0000-00000000b103",
    ],
    care: "00000000-0000-0000-0000-00000000b201",
    family: "00000000-0000-0000-0000-00000000b301",
  },
  reservationIds: [
    "00000000-0000-0000-0000-00000000c201",
    "00000000-0000-0000-0000-00000000c202",
  ],
};

export async function loadEnvFallbacks() {
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
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

export function getEnvOrThrow(primary, fallbacks = []) {
  const keys = [primary, ...fallbacks];
  for (const key of keys) {
    const value = process.env[key];
    if (value) return value;
  }
  throw new Error(`Missing required env var. Set one of: ${keys.join(", ")}`);
}

export async function createAdminClient() {
  await loadEnvFallbacks();
  const supabaseUrl = getEnvOrThrow("SUPABASE_URL", ["NEXT_PUBLIC_SUPABASE_URL"]);
  const serviceRoleKey = getEnvOrThrow("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function assertNoError(error, step) {
  if (error) {
    throw new Error(`${step} failed: ${error.message}`);
  }
}

export function isMissingTableError(error, tableName) {
  if (!error?.message) return false;
  return error.message.includes(`Could not find the table 'public.${tableName}' in the schema cache`);
}
