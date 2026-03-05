import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const SEED_TAG_PREFIX = "SEEDDBG";
const MANIFEST_PATH = "output/seed/seed-manifest.json";

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

async function checkSeedState() {
  await loadEnvFallbacks();

  const supabaseUrl = getEnvOrThrow("SUPABASE_URL", ["NEXT_PUBLIC_SUPABASE_URL"]);
  const serviceRoleKey = getEnvOrThrow("SUPABASE_SERVICE_ROLE_KEY");
  const primaryGuardianId = process.env.SEED_PRIMARY_GUARDIAN_ID ?? null;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const [chatRoomsRes, messagesRes, danglogsRes, commentsRes, likesRes] = await Promise.all([
    supabase.from("chat_rooms").select("id", { count: "exact", head: true }),
    supabase.from("chat_messages").select("id", { count: "exact", head: true }),
    supabase.from("danglogs").select("id", { count: "exact", head: true }),
    supabase.from("danglog_comments").select("id", { count: "exact", head: true }),
    supabase.from("danglog_likes").select("danglog_id", { count: "exact", head: true }),
  ]);

  if (chatRoomsRes.error) throw new Error(`chat_rooms check failed: ${chatRoomsRes.error.message}`);
  if (messagesRes.error) throw new Error(`chat_messages check failed: ${messagesRes.error.message}`);
  if (danglogsRes.error) throw new Error(`danglogs check failed: ${danglogsRes.error.message}`);
  if (commentsRes.error) throw new Error(`danglog_comments check failed: ${commentsRes.error.message}`);
  if (likesRes.error) throw new Error(`danglog_likes check failed: ${likesRes.error.message}`);

  const { data: seedMessages, error: seedMessagesErr } = await supabase
    .from("chat_messages")
    .select("id,room_id,type,content,created_at")
    .ilike("content", `${SEED_TAG_PREFIX}:%`)
    .order("created_at", { ascending: false })
    .limit(8);
  if (seedMessagesErr) throw new Error(`seed message sample failed: ${seedMessagesErr.message}`);

  const { data: seedDanglogsByTitle, error: byTitleErr } = await supabase
    .from("danglogs")
    .select("id,author_id,title,created_at")
    .ilike("title", `${SEED_TAG_PREFIX}:%`)
    .order("created_at", { ascending: false })
    .limit(8);
  if (byTitleErr) throw new Error(`seed danglog(title) sample failed: ${byTitleErr.message}`);

  const { data: seedDanglogsByContent, error: byContentErr } = await supabase
    .from("danglogs")
    .select("id,author_id,title,created_at,content")
    .ilike("content", `${SEED_TAG_PREFIX}:%`)
    .order("created_at", { ascending: false })
    .limit(8);
  if (byContentErr) throw new Error(`seed danglog(content) sample failed: ${byContentErr.message}`);

  const seedDanglogMap = new Map();
  for (const row of seedDanglogsByTitle ?? []) seedDanglogMap.set(row.id, row);
  for (const row of seedDanglogsByContent ?? []) seedDanglogMap.set(row.id, row);

  let primaryRoomCount = null;
  if (primaryGuardianId) {
    const { count, error } = await supabase
      .from("chat_participants")
      .select("room_id", { count: "exact", head: true })
      .eq("guardian_id", primaryGuardianId);
    if (error) throw new Error(`primary guardian room check failed: ${error.message}`);
    primaryRoomCount = count ?? 0;
  }

  const manifest = await readManifest();

  console.log("Seed check completed.");
  console.log("Totals:");
  console.log(`- chat_rooms: ${chatRoomsRes.count ?? 0}`);
  console.log(`- chat_messages: ${messagesRes.count ?? 0}`);
  console.log(`- danglogs: ${danglogsRes.count ?? 0}`);
  console.log(`- danglog_comments: ${commentsRes.count ?? 0}`);
  console.log(`- danglog_likes: ${likesRes.count ?? 0}`);
  if (primaryGuardianId) {
    console.log(`- primary guardian chat rooms (${primaryGuardianId}): ${primaryRoomCount}`);
  }

  console.log("Seed-tag samples:");
  console.log(`- tagged chat messages: ${(seedMessages ?? []).length}`);
  console.log(`- tagged danglogs: ${seedDanglogMap.size}`);

  if (manifest) {
    console.log("Manifest:");
    console.log(`- runId: ${manifest.runId}`);
    console.log(`- generatedAt: ${manifest.generatedAt}`);
    console.log(`- chat rooms in manifest: ${manifest?.created?.chat?.roomIds?.length ?? 0}`);
    console.log(`- danglogs in manifest: ${manifest?.created?.danglog?.ids?.length ?? 0}`);
  } else {
    console.log("Manifest: missing");
  }
}

checkSeedState().catch((error) => {
  console.error("[check-chat-danglog-debug] failed:", error.message);
  process.exitCode = 1;
});
