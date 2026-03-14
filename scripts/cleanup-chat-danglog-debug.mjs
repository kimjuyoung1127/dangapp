import { existsSync } from "node:fs";
import { readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const MANIFEST_DIR = "output/seed";
const MANIFEST_PATH = `${MANIFEST_DIR}/seed-manifest.json`;
const REPORT_PATH = `${MANIFEST_DIR}/cleanup-last.json`;

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

async function readManifest() {
  try {
    const raw = await readFile(MANIFEST_PATH, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error && error.code === "ENOENT") return null;
    throw error;
  }
}

async function cleanupSeedData() {
  await loadEnvFallbacks();

  const manifest = await readManifest();
  if (!manifest) {
    console.log("No manifest found. Nothing to cleanup.");
    return;
  }

  const supabaseUrl = getEnvOrThrow("SUPABASE_URL", ["NEXT_PUBLIC_SUPABASE_URL"]);
  const serviceRoleKey = getEnvOrThrow("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const roomIds = manifest?.created?.chat?.roomIds ?? [];
  const scheduleIds = manifest?.created?.chat?.scheduleIds ?? [];
  const danglogIds = manifest?.created?.danglog?.ids ?? [];

  if (danglogIds.length > 0) {
    await supabase.from("danglog_likes").delete().in("danglog_id", danglogIds);
    await supabase.from("danglog_comments").delete().in("danglog_id", danglogIds);
    await supabase.from("danglogs").delete().in("id", danglogIds);
  }

  if (roomIds.length > 0) {
    if (scheduleIds.length > 0) {
      await supabase.from("schedules").delete().in("id", scheduleIds);
    }
    await supabase.from("chat_messages").delete().in("room_id", roomIds);
    await supabase.from("chat_participants").delete().in("room_id", roomIds);
    await supabase.from("chat_rooms").delete().in("id", roomIds);
  }

  await mkdir(MANIFEST_DIR, { recursive: true });
  await writeFile(
    REPORT_PATH,
    `${JSON.stringify(
      {
        cleanedAt: new Date().toISOString(),
        runId: manifest.runId,
        removed: {
          roomCount: roomIds.length,
          scheduleCount: scheduleIds.length,
          danglogCount: danglogIds.length,
          messageCount: manifest?.created?.chat?.messageIds?.length ?? 0,
          commentCount: manifest?.created?.danglog?.commentIds?.length ?? 0,
          likeCount: manifest?.created?.danglog?.likePairs?.length ?? 0,
        },
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  await rm(MANIFEST_PATH, { force: true });

  console.log("Cleanup completed.");
  console.log(`runId=${manifest.runId}`);
  console.log(`removed rooms=${roomIds.length}, danglogs=${danglogIds.length}`);
  console.log(`report=${REPORT_PATH}`);
}

cleanupSeedData().catch((error) => {
  console.error("[cleanup-chat-danglog-debug] failed:", error.message);
  process.exitCode = 1;
});
