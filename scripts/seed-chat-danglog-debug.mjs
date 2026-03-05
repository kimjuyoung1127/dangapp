import { existsSync } from "node:fs";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const SEED_TAG_PREFIX = "SEEDDBG";
const MANIFEST_DIR = "output/seed";
const MANIFEST_PATH = `${MANIFEST_DIR}/seed-manifest.json`;
const TTL_DAYS = 7;

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

function parsePartnerIds(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function isoFromMinutesAgo(minutesAgo) {
  const ts = Date.now() - minutesAgo * 60 * 1000;
  return new Date(ts).toISOString();
}

function assertNoError(error, step) {
  if (error) {
    throw new Error(`${step} failed: ${error.message}`);
  }
}

async function cleanupExpiredSeedData(supabase, cutoffIso) {
  const cleanupSummary = {
    oldDanglogCount: 0,
    oldRoomCount: 0,
  };

  const { data: oldDanglogs, error: oldDanglogsErr } = await supabase
    .from("danglogs")
    .select("id,title,content,created_at")
    .lt("created_at", cutoffIso)
    .order("created_at", { ascending: true })
    .limit(2000);

  assertNoError(oldDanglogsErr, "query old danglogs");

  const expiredDanglogIds = (oldDanglogs ?? [])
    .filter((row) => {
      const title = row.title ?? "";
      const content = row.content ?? "";
      return title.startsWith(`${SEED_TAG_PREFIX}:`) || content.startsWith(`${SEED_TAG_PREFIX}:`);
    })
    .map((row) => row.id);

  if (expiredDanglogIds.length > 0) {
    await supabase.from("danglog_likes").delete().in("danglog_id", expiredDanglogIds);
    await supabase.from("danglog_comments").delete().in("danglog_id", expiredDanglogIds);
    await supabase.from("danglogs").delete().in("id", expiredDanglogIds);
    cleanupSummary.oldDanglogCount = expiredDanglogIds.length;
  }

  const { data: oldMarkers, error: oldMarkersErr } = await supabase
    .from("chat_messages")
    .select("id,room_id,content,created_at,type")
    .eq("type", "system")
    .lt("created_at", cutoffIso)
    .order("created_at", { ascending: true })
    .limit(2000);

  assertNoError(oldMarkersErr, "query old chat markers");

  const expiredRoomIds = Array.from(
    new Set(
      (oldMarkers ?? [])
        .filter((row) => (row.content ?? "").startsWith(`${SEED_TAG_PREFIX}:RUN:`))
        .map((row) => row.room_id)
    )
  );

  if (expiredRoomIds.length > 0) {
    await supabase.from("chat_messages").delete().in("room_id", expiredRoomIds);
    await supabase.from("chat_participants").delete().in("room_id", expiredRoomIds);
    await supabase.from("chat_rooms").delete().in("id", expiredRoomIds);
    cleanupSummary.oldRoomCount = expiredRoomIds.length;
  }

  return cleanupSummary;
}

async function resolvePartners(supabase, primaryGuardianId, explicitPartnerIds) {
  if (explicitPartnerIds.length > 0) {
    return explicitPartnerIds;
  }

  const { data, error } = await supabase
    .from("guardians")
    .select("id")
    .neq("id", primaryGuardianId)
    .order("created_at", { ascending: true })
    .limit(2);

  assertNoError(error, "auto-resolve partner guardians");
  return (data ?? []).map((row) => row.id);
}

async function seedDebugData() {
  await loadEnvFallbacks();

  const supabaseUrl = getEnvOrThrow("SUPABASE_URL", ["NEXT_PUBLIC_SUPABASE_URL"]);
  const serviceRoleKey = getEnvOrThrow("SUPABASE_SERVICE_ROLE_KEY");
  const primaryGuardianId = getEnvOrThrow("SEED_PRIMARY_GUARDIAN_ID");
  const partnerIdsFromEnv = parsePartnerIds(process.env.SEED_PARTNER_GUARDIAN_IDS);
  const runId = `${Date.now()}`;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const cutoffIso = new Date(Date.now() - TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const cleanupSummary = await cleanupExpiredSeedData(supabase, cutoffIso);

  const partnerGuardianIds = await resolvePartners(supabase, primaryGuardianId, partnerIdsFromEnv);
  if (partnerGuardianIds.length < 2) {
    throw new Error("Need at least 2 partner guardians. Set SEED_PARTNER_GUARDIAN_IDS with two UUIDs.");
  }

  const selectedPartnerIds = partnerGuardianIds.slice(0, 2);
  const allGuardianIds = [primaryGuardianId, ...selectedPartnerIds];

  const { data: guardians, error: guardiansErr } = await supabase
    .from("guardians")
    .select("id,nickname")
    .in("id", allGuardianIds);
  assertNoError(guardiansErr, "fetch guardians");

  if (!guardians || guardians.length < 3) {
    throw new Error("Primary/partner guardians not found in public.guardians.");
  }

  const { data: dogs, error: dogsErr } = await supabase
    .from("dogs")
    .select("id,guardian_id,created_at")
    .in("guardian_id", allGuardianIds)
    .order("created_at", { ascending: true });
  assertNoError(dogsErr, "fetch dogs");

  const primaryDogId = (dogs ?? []).find((d) => d.guardian_id === primaryGuardianId)?.id ?? null;
  const partnerDogMap = new Map();
  for (const partnerId of selectedPartnerIds) {
    const dogId = (dogs ?? []).find((d) => d.guardian_id === partnerId)?.id ?? null;
    partnerDogMap.set(partnerId, dogId);
  }

  const manifest = {
    version: 1,
    tagPrefix: SEED_TAG_PREFIX,
    runId,
    generatedAt: new Date().toISOString(),
    ttlDays: TTL_DAYS,
    guardians: {
      primaryId: primaryGuardianId,
      partnerIds: selectedPartnerIds,
    },
    created: {
      chat: {
        roomIds: [],
        messageIds: [],
      },
      danglog: {
        ids: [],
        commentIds: [],
        likePairs: [],
      },
    },
    cleanup: cleanupSummary,
  };

  for (const partnerId of selectedPartnerIds) {
    const { data: room, error: roomErr } = await supabase
      .from("chat_rooms")
      .insert({ type: "direct" })
      .select("id")
      .single();
    assertNoError(roomErr, "insert chat room");

    const roomId = room.id;
    manifest.created.chat.roomIds.push(roomId);

    const participants = [
      { room_id: roomId, guardian_id: primaryGuardianId },
      { room_id: roomId, guardian_id: partnerId },
    ];

    const { error: participantErr } = await supabase.from("chat_participants").insert(participants);
    assertNoError(participantErr, "insert chat participants");

    const markerAt = isoFromMinutesAgo(90);
    const messageRows = [
      {
        room_id: roomId,
        sender_id: null,
        type: "system",
        content: `${SEED_TAG_PREFIX}:RUN:${runId}: room bootstrap`,
        metadata: { runId, seed: true },
        read_by: [primaryGuardianId, partnerId],
        created_at: markerAt,
      },
      {
        room_id: roomId,
        sender_id: primaryGuardianId,
        type: "text",
        content: `${SEED_TAG_PREFIX}:${runId}: 안녕하세요! 디버그 채팅 시작해요.`,
        metadata: null,
        read_by: [primaryGuardianId, partnerId],
        created_at: isoFromMinutesAgo(88),
      },
      {
        room_id: roomId,
        sender_id: partnerId,
        type: "text",
        content: `${SEED_TAG_PREFIX}:${runId}: 반가워요. 오늘 산책 가능해요?`,
        metadata: null,
        read_by: [primaryGuardianId, partnerId],
        created_at: isoFromMinutesAgo(82),
      },
      {
        room_id: roomId,
        sender_id: primaryGuardianId,
        type: "image",
        content: `${SEED_TAG_PREFIX}:${runId}: 방금 찍은 사진이에요.`,
        metadata: {
          image_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
          caption: "debug image",
        },
        read_by: [primaryGuardianId, partnerId],
        created_at: isoFromMinutesAgo(77),
      },
      {
        room_id: roomId,
        sender_id: partnerId,
        type: "schedule",
        content: `${SEED_TAG_PREFIX}:${runId}: 이번 주 토요일 만나요.`,
        metadata: {
          date: "2026-03-07",
          time: "18:30",
          location: "서울숲 입구",
        },
        read_by: [primaryGuardianId, partnerId],
        created_at: isoFromMinutesAgo(70),
      },
      {
        room_id: roomId,
        sender_id: primaryGuardianId,
        type: "text",
        content: `${SEED_TAG_PREFIX}:${runId}: 좋아요. 물 챙겨갈게요.`,
        metadata: null,
        read_by: [primaryGuardianId, partnerId],
        created_at: isoFromMinutesAgo(63),
      },
      {
        room_id: roomId,
        sender_id: partnerId,
        type: "text",
        content: `${SEED_TAG_PREFIX}:${runId}: 저는 간식 챙겨갈게요.`,
        metadata: null,
        read_by: [primaryGuardianId, partnerId],
        created_at: isoFromMinutesAgo(55),
      },
      {
        room_id: roomId,
        sender_id: primaryGuardianId,
        type: "text",
        content: `${SEED_TAG_PREFIX}:${runId}: 혹시 비 오면 실내 카페로 갈까요?`,
        metadata: null,
        read_by: [primaryGuardianId, partnerId],
        created_at: isoFromMinutesAgo(48),
      },
      {
        room_id: roomId,
        sender_id: partnerId,
        type: "text",
        content: `${SEED_TAG_PREFIX}:${runId}: 네, 카페 플랜도 좋아요.`,
        metadata: null,
        read_by: [partnerId],
        created_at: isoFromMinutesAgo(18),
      },
      {
        room_id: roomId,
        sender_id: partnerId,
        type: "text",
        content: `${SEED_TAG_PREFIX}:${runId}: 출발 전에 다시 메시지 남길게요.`,
        metadata: null,
        read_by: [partnerId],
        created_at: isoFromMinutesAgo(7),
      },
    ];

    const { data: insertedMessages, error: messagesErr } = await supabase
      .from("chat_messages")
      .insert(messageRows)
      .select("id,created_at");
    assertNoError(messagesErr, "insert chat messages");

    manifest.created.chat.messageIds.push(...(insertedMessages ?? []).map((m) => m.id));

    const lastMessageAt = insertedMessages?.at(-1)?.created_at ?? new Date().toISOString();
    const { error: updateRoomErr } = await supabase
      .from("chat_rooms")
      .update({ last_message_at: lastMessageAt })
      .eq("id", roomId);
    assertNoError(updateRoomErr, "update room last_message_at");
  }

  const danglogAuthors = [
    primaryGuardianId,
    primaryGuardianId,
    primaryGuardianId,
    primaryGuardianId,
    primaryGuardianId,
    primaryGuardianId,
    selectedPartnerIds[0],
    selectedPartnerIds[0],
    selectedPartnerIds[1],
    selectedPartnerIds[1],
  ];

  const danglogRows = danglogAuthors.map((authorId, index) => {
    const isPrimary = authorId === primaryGuardianId;
    const dogId = isPrimary ? primaryDogId : partnerDogMap.get(authorId) ?? null;
    return {
      author_id: authorId,
      dog_id: dogId,
      title: `${SEED_TAG_PREFIX}:${runId}: debug-danglog-${index + 1}`,
      content: `${SEED_TAG_PREFIX}:${runId}: 디버그용 댕로그 본문 ${index + 1}`,
      image_urls: index % 3 === 0
        ? ["https://images.unsplash.com/photo-1517849845537-4d257902454a"]
        : [],
      activity_type: index % 2 === 0 ? "walk" : "daily",
      shared_with: [],
      co_authors: [],
      created_at: isoFromMinutesAgo(240 - index * 12),
      updated_at: isoFromMinutesAgo(240 - index * 12),
    };
  });

  const { data: insertedDanglogs, error: danglogsErr } = await supabase
    .from("danglogs")
    .insert(danglogRows)
    .select("id,author_id,created_at");
  assertNoError(danglogsErr, "insert danglogs");

  manifest.created.danglog.ids.push(...(insertedDanglogs ?? []).map((d) => d.id));

  const commentRows = [];
  for (const [index, log] of (insertedDanglogs ?? []).entries()) {
    const commentAuthor = log.author_id === primaryGuardianId ? selectedPartnerIds[0] : primaryGuardianId;
    commentRows.push({
      danglog_id: log.id,
      author_id: commentAuthor,
      content: `${SEED_TAG_PREFIX}:${runId}: 댓글 ${index + 1}`,
      created_at: isoFromMinutesAgo(120 - index * 3),
      updated_at: isoFromMinutesAgo(120 - index * 3),
    });
    if (index % 2 === 0) {
      const secondAuthor = selectedPartnerIds[1];
      commentRows.push({
        danglog_id: log.id,
        author_id: secondAuthor,
        content: `${SEED_TAG_PREFIX}:${runId}: 추가 댓글 ${index + 1}`,
        created_at: isoFromMinutesAgo(118 - index * 3),
        updated_at: isoFromMinutesAgo(118 - index * 3),
      });
    }
  }

  const { data: insertedComments, error: commentsErr } = await supabase
    .from("danglog_comments")
    .insert(commentRows)
    .select("id");
  assertNoError(commentsErr, "insert danglog comments");
  manifest.created.danglog.commentIds.push(...(insertedComments ?? []).map((c) => c.id));

  const likeRows = [];
  for (const log of insertedDanglogs ?? []) {
    likeRows.push({ danglog_id: log.id, guardian_id: primaryGuardianId });
    likeRows.push({ danglog_id: log.id, guardian_id: selectedPartnerIds[0] });
    if (log.author_id === primaryGuardianId) {
      likeRows.push({ danglog_id: log.id, guardian_id: selectedPartnerIds[1] });
    }
  }

  const uniqueLikeKey = new Set();
  const uniqueLikeRows = likeRows.filter((row) => {
    const key = `${row.danglog_id}:${row.guardian_id}`;
    if (uniqueLikeKey.has(key)) return false;
    uniqueLikeKey.add(key);
    return true;
  });

  const { error: likesErr } = await supabase.from("danglog_likes").insert(uniqueLikeRows);
  assertNoError(likesErr, "insert danglog likes");
  manifest.created.danglog.likePairs = uniqueLikeRows;

  await mkdir(MANIFEST_DIR, { recursive: true });
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log("Seed completed.");
  console.log(`runId=${runId}`);
  console.log(`rooms=${manifest.created.chat.roomIds.length}, messages=${manifest.created.chat.messageIds.length}`);
  console.log(`danglogs=${manifest.created.danglog.ids.length}, comments=${manifest.created.danglog.commentIds.length}, likes=${manifest.created.danglog.likePairs.length}`);
  console.log(`manifest=${MANIFEST_PATH}`);
}

seedDebugData().catch((error) => {
  console.error("[seed-chat-danglog-debug] failed:", error.message);
  process.exitCode = 1;
});
