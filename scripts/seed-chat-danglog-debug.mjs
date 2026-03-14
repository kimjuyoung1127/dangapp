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

function isoFromDaysAhead(daysAhead, hour, minute) {
  const target = new Date();
  target.setDate(target.getDate() + daysAhead);
  target.setHours(hour, minute, 0, 0);
  return target.toISOString();
}

function assertNoError(error, step) {
  if (error) {
    throw new Error(`${step} failed: ${error.message}`);
  }
}

const CHAT_SEED_SCENARIOS = [
  {
    scheduleTitle: "서울숲 첫 산책 제안",
    scheduleLocation: "서울숲 3번 출구 앞",
    scheduleDate: () => isoFromDaysAhead(2, 18, 30),
    messages: [
      "안녕하세요. 프로필 보고 먼저 인사드려요. 저희 아이가 첫 만남엔 천천히 걷는 편이라 가볍게 한 바퀴 같이 해보면 좋을 것 같아요.",
      "반가워요. 저희도 처음엔 냄새 맡는 시간부터 충분히 주는 편이라 편하게 만나실 수 있을 것 같아요.",
      "오늘 아침 산책 사진 보내드려요. 하네스 착용한 모습 참고해주세요.",
      "이번 주 토요일 6시 30분에 서울숲 3번 출구 앞에서 만나서 40분 정도 걸어볼까요?",
      "좋아요. 배변봉투랑 물은 제가 챙겨갈게요.",
      "저는 작은 간식만 준비할게요. 혹시 알레르기 있으면 미리 알려주세요.",
      "혹시 비 오면 맞은편 펫프렌들리 카페로 옮겨도 괜찮으실까요?",
      "네, 우비 입고 잠깐 걷다가 카페로 들어가도 좋겠어요.",
      "출발 전에 주차 상황만 한 번 더 남길게요.",
    ],
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
    imageCaption: "오늘 아침 산책 직전 모습",
  },
  {
    scheduleTitle: "등원 전 아침 산책 제안",
    scheduleLocation: "분당중앙공원 북문",
    scheduleDate: () => isoFromDaysAhead(4, 8, 10),
    messages: [
      "안녕하세요. 다음 주 화요일 아침에 등원 전에 짧게 산책 같이 가능하실까요?",
      "네 가능해요. 저희는 8시 10분쯤 분당중앙공원 북문 쪽으로 도착할 수 있어요.",
      "콩이가 오늘 컨디션 좋아서 사진 먼저 보내드려요. 사람보다 강아지한테 먼저 다가가는 편이에요.",
      "그럼 화요일 8시 10분에 분당중앙공원 북문에서 만나서 30분 정도 산책해요.",
      "좋습니다. 하네스는 파란색이고, 물 마시는 타이밍이 빨라서 중간에 한 번 쉬면 좋아요.",
      "저희는 만나면 바로 뛰기보다 냄새 맡는 시간을 먼저 주는 편이라 그 흐름으로 가볼게요.",
      "혹시 조금 늦어지면 10분 전에 메시지 드릴게요.",
      "네, 저도 도착하면 입구 사진 한번 보내드릴게요.",
      "감사해요. 끝나고 아이들 반응 좋으면 다음 주에도 같은 시간으로 맞춰봐요.",
    ],
    imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a",
    imageCaption: "아침 산책 나가기 전",
  },
];

const DANGLOG_SEED_ENTRIES = [
  { title: "비 오기 전에 짧게 동네 한 바퀴", content: "아침에 비 오기 전이라 20분만 가볍게 돌았어요. 초반엔 냄새 맡느라 천천히 걷다가 마지막엔 제법 경쾌하게 걸어서 컨디션이 좋아 보였네요.", activity_type: "walk" },
  { title: "산책 후 발 닦기 훈련 성공", content: "집에 와서 발 닦는 시간을 조금 길게 가져봤는데 오늘은 도망가지 않고 끝까지 잘 기다려줬어요. 간식 한 알로 마무리했더니 표정이 꽤 뿌듯했습니다.", activity_type: "daily" },
  { title: "새 하네스 적응 연습", content: "처음엔 어색해했지만 집 앞에서 잠깐 걷고 나니 금방 익숙해졌어요. 다음 주엔 조금 더 긴 코스로 나가봐도 될 것 같습니다.", activity_type: "walk" },
  { title: "주말 공원에서 친구 강아지 만나기", content: "낯선 친구를 만나면 먼저 한 발 뒤로 물러나는 편인데 오늘은 생각보다 빨리 꼬리를 흔들었어요. 짧게 인사하고 각자 걷는 정도가 딱 좋았습니다.", activity_type: "daily" },
  { title: "병원 다녀온 날이라 실내 놀이 위주", content: "예방접종하고 와서 멀리 걷지는 않고 실내에서 노즈워크 매트로 에너지 풀어줬어요. 저녁쯤엔 평소처럼 장난감을 가져와서 컨디션은 괜찮아 보였습니다.", activity_type: "daily" },
  { title: "저녁 산책에서 엘리베이터 연습", content: "사람 많은 시간대라 조금 긴장했지만 엘리베이터 앞에서 기다리는 연습을 몇 번 반복하니 훨씬 차분해졌어요. 짧은 산책이어도 배운 게 많은 날이었네요.", activity_type: "walk" },
  { title: "낮잠 푹 자고 저녁에 집중력 최고", content: "오후에 푹 쉬고 나서 그런지 저녁 훈련 때 이름 부르면 바로 돌아봤어요. 짧게 앉아, 기다려를 반복했는데 성공률이 꽤 좋았습니다.", activity_type: "daily" },
  { title: "한강 산책 후 물 마시는 속도 체크", content: "날씨가 풀려서 한강 쪽으로 다녀왔는데 중간에 물을 자주 찾더라고요. 다음엔 휴대용 물그릇을 더 자주 꺼내줘야겠어요.", activity_type: "walk" },
  { title: "낯선 소리에도 금방 안정 찾기", content: "오토바이 소리에 잠깐 놀랐지만 바로 제 옆으로 와서 진정했어요. 예전보다 회복이 빨라져서 산책이 한결 수월해졌습니다.", activity_type: "daily" },
  { title: "주중 마지막 산책은 느긋하게", content: "오늘은 속도보다 리듬을 맞추는 데 집중했어요. 중간중간 눈 마주치며 보폭을 맞추니 저도 마음이 좀 느긋해지더라고요.", activity_type: "walk" },
];

const DANGLOG_COMMENT_PAIRS = [
  ["사진 분위기 너무 좋아요. 하네스도 잘 어울리네요.", "표정이 편안해 보여서 저도 괜히 마음이 놓이네요."],
  ["발 닦기 기다려준 거 정말 큰 발전이네요.", "이럴 때 하나씩 루틴이 잡히는 느낌이라 뿌듯하죠."],
  ["새 장비 적응 속도가 생각보다 빠르네요.", "짧게 자주 해주면 확실히 거부감이 덜한 것 같아요."],
  ["친구 강아지랑 거리 조절이 잘 된 것 같아요.", "무리하지 않고 짧게 끝내는 게 오히려 다음 만남에 도움 되더라고요."],
  ["병원 다녀온 날엔 실내 놀이가 최고죠.", "노즈워크 하고 나면 확실히 표정이 부드러워지는 것 같아요."],
  ["엘리베이터 앞 기다리기 정말 중요하더라고요.", "이런 기초가 쌓이니까 외출이 한결 편해지는 것 같아요."],
  ["이름 불렀을 때 바로 보는 순간이 참 기분 좋죠.", "짧게 자주 해주는 게 집중력 유지에 도움이 되는 것 같아요."],
  ["한강 쪽은 물 챙기는 게 정말 중요하죠.", "휴대용 물그릇 쓰면 쉬는 타이밍 잡기도 편하더라고요."],
  ["놀랐다가도 빨리 진정한 게 정말 좋아 보여요.", "보호자 옆으로 바로 오는 반응이 생기면 훨씬 안심되죠."],
  ["느긋하게 보폭 맞추는 산책이 오히려 만족도가 높더라고요.", "맞아요. 천천히 걸은 날이 오히려 집에 와서도 안정적이더라고요."],
];

async function cleanupExpiredSeedData(supabase, cutoffIso) {
  const cleanupSummary = {
    oldDanglogCount: 0,
    oldRoomCount: 0,
    oldScheduleCount: 0,
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
    const { data: expiredSchedules, error: expiredSchedulesErr } = await supabase
      .from("schedules")
      .select("id")
      .in("room_id", expiredRoomIds);
    assertNoError(expiredSchedulesErr, "query expired schedules");

    const expiredScheduleIds = (expiredSchedules ?? []).map((row) => row.id);
    if (expiredScheduleIds.length > 0) {
      await supabase.from("schedules").delete().in("id", expiredScheduleIds);
      cleanupSummary.oldScheduleCount = expiredScheduleIds.length;
    }

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
        scheduleIds: [],
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
    const scenario = CHAT_SEED_SCENARIOS[manifest.created.chat.roomIds.length - 1] ?? CHAT_SEED_SCENARIOS[0];
    const scheduleDatetime = scenario.scheduleDate();
    const scheduleId = crypto.randomUUID();
    const scheduleDate = new Date(scheduleDatetime);
    const scheduleDateLabel = scheduleDatetime.slice(0, 10);
    const scheduleTimeLabel = scheduleDate.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const { error: scheduleErr } = await supabase.from("schedules").insert({
      id: scheduleId,
      room_id: roomId,
      organizer_id: partnerId,
      title: scenario.scheduleTitle,
      datetime: scheduleDatetime,
      location_name: scenario.scheduleLocation,
      place_detail: "근처 벤치 앞에서 먼저 인사하고 출발",
      participant_ids: [primaryGuardianId, partnerId],
      status: "proposed",
      proposal_status: "proposed",
    });
    assertNoError(scheduleErr, "insert chat seed schedule");

    if (!manifest.created.chat.scheduleIds) {
      manifest.created.chat.scheduleIds = [];
    }
    manifest.created.chat.scheduleIds.push(scheduleId);

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
        content: scenario.messages[0],
        metadata: null,
        read_by: [primaryGuardianId, partnerId],
        created_at: isoFromMinutesAgo(88),
      },
      {
        room_id: roomId,
        sender_id: partnerId,
        type: "text",
        content: scenario.messages[1],
        metadata: null,
        read_by: [primaryGuardianId, partnerId],
        created_at: isoFromMinutesAgo(82),
      },
      {
        room_id: roomId,
        sender_id: primaryGuardianId,
        type: "image",
        content: scenario.messages[2],
        metadata: {
          image_url: scenario.imageUrl,
          caption: scenario.imageCaption,
        },
        read_by: [primaryGuardianId, partnerId],
        created_at: isoFromMinutesAgo(77),
      },
      {
        room_id: roomId,
        sender_id: partnerId,
        type: "schedule",
        content: scenario.messages[3],
        metadata: {
          scheduleId,
          date: scheduleDateLabel,
          time: scheduleTimeLabel,
          location: scenario.scheduleLocation,
          title: scenario.scheduleTitle,
          proposalStatus: "proposed",
          status: "proposed",
        },
        read_by: [primaryGuardianId, partnerId],
        created_at: isoFromMinutesAgo(70),
      },
      {
        room_id: roomId,
        sender_id: primaryGuardianId,
        type: "text",
        content: scenario.messages[4],
        metadata: null,
        read_by: [primaryGuardianId, partnerId],
        created_at: isoFromMinutesAgo(63),
      },
      {
        room_id: roomId,
        sender_id: partnerId,
        type: "text",
        content: scenario.messages[5],
        metadata: null,
        read_by: [primaryGuardianId, partnerId],
        created_at: isoFromMinutesAgo(55),
      },
      {
        room_id: roomId,
        sender_id: primaryGuardianId,
        type: "text",
        content: scenario.messages[6],
        metadata: null,
        read_by: [primaryGuardianId, partnerId],
        created_at: isoFromMinutesAgo(48),
      },
      {
        room_id: roomId,
        sender_id: partnerId,
        type: "text",
        content: scenario.messages[7],
        metadata: null,
        read_by: [partnerId],
        created_at: isoFromMinutesAgo(18),
      },
      {
        room_id: roomId,
        sender_id: partnerId,
        type: "text",
        content: scenario.messages[8],
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
    const entry = DANGLOG_SEED_ENTRIES[index % DANGLOG_SEED_ENTRIES.length];
    return {
      author_id: authorId,
      dog_id: dogId,
      title: entry.title,
      content: entry.content,
      image_urls: index % 3 === 0
        ? ["https://images.unsplash.com/photo-1517849845537-4d257902454a"]
        : [],
      activity_type: entry.activity_type,
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
    const commentPair = DANGLOG_COMMENT_PAIRS[index % DANGLOG_COMMENT_PAIRS.length];
    commentRows.push({
      danglog_id: log.id,
      author_id: commentAuthor,
      content: commentPair[0],
      created_at: isoFromMinutesAgo(120 - index * 3),
      updated_at: isoFromMinutesAgo(120 - index * 3),
    });
    if (index % 2 === 0) {
      const secondAuthor = selectedPartnerIds[1];
      commentRows.push({
        danglog_id: log.id,
        author_id: secondAuthor,
        content: commentPair[1],
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
