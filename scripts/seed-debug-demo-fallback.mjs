import {
  DEBUG_DEMO_IDS,
  assertNoError,
  createAdminClient,
  isMissingTableError,
} from "./debug-demo-fallback-common.mjs";

const homeGuardians = [
  {
    id: DEBUG_DEMO_IDS.homeGuardianIds[0],
    email: "debug.home.minji@example.local",
    nickname: "민지",
    bio: "주말마다 서울숲에서 짧게라도 같이 걸을 수 있는 동네 산책 친구를 찾고 있어요.",
    address_name: "서울숲",
    trust_score: 94,
    trust_level: 5,
    activity_times: ["morning", "evening"],
    lng: 127.0437,
    lat: 37.5446,
    dog: {
      id: DEBUG_DEMO_IDS.dogIds.home[0],
      name: "보리",
      breed: "Poodle",
      age: 3,
      weight_kg: 5.8,
      gender: "female",
      temperament: ["gentle", "playful"],
    },
  },
  {
    id: DEBUG_DEMO_IDS.homeGuardianIds[1],
    email: "debug.home.ian@example.local",
    nickname: "이안",
    bio: "처음 만날 때는 시간과 장소를 미리 또렷하게 맞추는 편이라 차분한 산책 약속을 선호해요.",
    address_name: "잠실",
    trust_score: 88,
    trust_level: 4,
    activity_times: ["afternoon", "evening"],
    lng: 127.098,
    lat: 37.5133,
    dog: {
      id: DEBUG_DEMO_IDS.dogIds.home[1],
      name: "밀로",
      breed: "Corgi",
      age: 4,
      weight_kg: 10.2,
      gender: "male",
      temperament: ["steady", "friendly"],
    },
  },
  {
    id: DEBUG_DEMO_IDS.homeGuardianIds[2],
    email: "debug.home.sora@example.local",
    nickname: "소라",
    bio: "평일엔 짧은 돌봄 연계, 주말엔 가족 모임처럼 느긋한 산책을 함께할 분이면 좋겠어요.",
    address_name: "마포",
    trust_score: 81,
    trust_level: 4,
    activity_times: ["morning"],
    lng: 126.9054,
    lat: 37.5515,
    dog: {
      id: DEBUG_DEMO_IDS.dogIds.home[2],
      name: "도도",
      breed: "Maltese",
      age: 2,
      weight_kg: 4.1,
      gender: "female",
      temperament: ["bright", "social"],
    },
  },
];

const careGuardian = {
  id: DEBUG_DEMO_IDS.careGuardianId,
  email: "debug.care.hana@example.local",
  nickname: "하나",
  bio: "급하게 맡기기보다 인수인계가 꼼꼼한 돌봄 파트너를 찾는 편이에요.",
  address_name: "성수",
  trust_score: 76,
  trust_level: 4,
  activity_times: ["afternoon", "evening"],
  lng: 127.0564,
  lat: 37.5448,
  dog: {
    id: DEBUG_DEMO_IDS.dogIds.care,
    name: "코코",
    breed: "Bichon Frise",
    age: 5,
    weight_kg: 6.4,
    gender: "female",
    temperament: ["clean", "affectionate"],
  },
};

const familyGuardian = {
  id: DEBUG_DEMO_IDS.familyGuardianId,
  email: "debug.family.jiho@example.local",
  nickname: "지호",
  bio: "가족 일정이 자주 바뀌는 편이라 같이 맡아줄 수 있는 든든한 공동 돌봄 루틴을 만들고 싶어요.",
  address_name: "분당",
  trust_score: 84,
  trust_level: 4,
  activity_times: ["morning", "evening"],
  lng: 127.1089,
  lat: 37.3596,
  dog: {
    id: DEBUG_DEMO_IDS.dogIds.family,
    name: "콩",
    breed: "Shiba",
    age: 4,
    weight_kg: 8.3,
    gender: "male",
    temperament: ["alert", "independent"],
  },
};

const demoPlaces = [
  {
    id: DEBUG_DEMO_IDS.carePlaceIds[0],
    name: "성수 산책 라운지",
    category: "park",
    address_name: "성수동",
    description: "아침 산책 전에 만나기 좋은 조용한 코스예요. 물그릇과 그늘 벤치가 가까워서 첫 만남 장소로 많이들 쓰더라고요.",
    photo_urls: [],
    business_hours: null,
    is_verified: true,
    amenities: ["water", "shade", "parking"],
  },
  {
    id: DEBUG_DEMO_IDS.carePlaceIds[1],
    name: "뚝섬 케어 스팟",
    category: "cafe",
    address_name: "뚝섬",
    description: "비 오는 날에도 인수인계하기 편한 실내 대기 장소예요. 짧게 브리핑하고 출발하기 좋습니다.",
    photo_urls: [],
    business_hours: null,
    is_verified: true,
    amenities: ["indoor", "rest area"],
  },
];

const demoReservations = [
  {
    id: DEBUG_DEMO_IDS.reservationIds[0],
    place_id: DEBUG_DEMO_IDS.carePlaceIds[0],
    guardian_id: DEBUG_DEMO_IDS.careGuardianId,
    dog_id: DEBUG_DEMO_IDS.dogIds.care,
    reserved_at: "2026-03-09T09:00:00.000Z",
    status: "pending",
    guest_count: 1,
    request_memo: "아침 9시에 코코 맡기고 싶어요. 낯가림이 조금 있어서 첫 5분만 천천히 인사 부탁드려요.",
  },
  {
    id: DEBUG_DEMO_IDS.reservationIds[1],
    place_id: DEBUG_DEMO_IDS.carePlaceIds[1],
    guardian_id: DEBUG_DEMO_IDS.careGuardianId,
    dog_id: DEBUG_DEMO_IDS.dogIds.care,
    reserved_at: "2026-03-12T12:30:00.000Z",
    status: "confirmed",
    guest_count: 2,
    request_memo: "가족 한 명이 같이 가서 점심 전후로 인수인계할 예정이에요. 하네스는 초록색입니다.",
  },
];

const demoGroups = [
  {
    id: DEBUG_DEMO_IDS.familyGroupIds[0],
    name: "주말 산책 모임",
    creator_id: DEBUG_DEMO_IDS.familyGuardianId,
    dog_ids: [DEBUG_DEMO_IDS.dogIds.family, DEBUG_DEMO_IDS.dogIds.home[0]],
  },
  {
    id: DEBUG_DEMO_IDS.familyGroupIds[1],
    name: "등하원 백업 팀",
    creator_id: DEBUG_DEMO_IDS.familyGuardianId,
    dog_ids: [DEBUG_DEMO_IDS.dogIds.family],
  },
];

const demoGroupMembers = [
  { group_id: DEBUG_DEMO_IDS.familyGroupIds[0], member_id: DEBUG_DEMO_IDS.familyGuardianId, role: "owner" },
  { group_id: DEBUG_DEMO_IDS.familyGroupIds[0], member_id: DEBUG_DEMO_IDS.homeGuardianIds[0], role: "admin" },
  { group_id: DEBUG_DEMO_IDS.familyGroupIds[0], member_id: DEBUG_DEMO_IDS.homeGuardianIds[1], role: "member" },
  { group_id: DEBUG_DEMO_IDS.familyGroupIds[1], member_id: DEBUG_DEMO_IDS.familyGuardianId, role: "owner" },
  { group_id: DEBUG_DEMO_IDS.familyGroupIds[1], member_id: DEBUG_DEMO_IDS.homeGuardianIds[2], role: "member" },
];

const demoOwnerships = [
  {
    dog_id: DEBUG_DEMO_IDS.dogIds.family,
    guardian_id: DEBUG_DEMO_IDS.familyGuardianId,
    role: "owner",
    is_primary: true,
  },
  {
    dog_id: DEBUG_DEMO_IDS.dogIds.home[0],
    guardian_id: DEBUG_DEMO_IDS.familyGuardianId,
    role: "co_owner",
    is_primary: false,
  },
];

const demoRooms = [
  {
    id: DEBUG_DEMO_IDS.roomIds[0],
    type: "group",
    last_message_at: "2026-03-07T08:15:00.000Z",
  },
  {
    id: DEBUG_DEMO_IDS.roomIds[1],
    type: "group",
    last_message_at: "2026-03-07T09:05:00.000Z",
  },
];

const demoSchedules = [
  {
    id: DEBUG_DEMO_IDS.familyScheduleIds[0],
    room_id: DEBUG_DEMO_IDS.roomIds[0],
    organizer_id: DEBUG_DEMO_IDS.familyGuardianId,
    title: "토요일 저녁 한강 산책",
    location_name: "뚝섬 한강공원",
    place_detail: "북문 커피 스탠드 앞",
    datetime: "2026-03-08T01:00:00.000Z",
    status: "confirmed",
    proposal_status: "accepted",
    confirmed_at: "2026-03-07T12:00:00.000Z",
    participant_ids: [DEBUG_DEMO_IDS.familyGuardianId, DEBUG_DEMO_IDS.homeGuardianIds[0]],
  },
  {
    id: DEBUG_DEMO_IDS.familyScheduleIds[1],
    room_id: DEBUG_DEMO_IDS.roomIds[1],
    organizer_id: DEBUG_DEMO_IDS.homeGuardianIds[2],
    title: "등원 전 짧은 아침 산책",
    location_name: "분당중앙공원",
    place_detail: "주차장 입구 앞",
    datetime: "2026-03-10T09:30:00.000Z",
    status: "proposed",
    proposal_status: "proposed",
    confirmed_at: null,
    participant_ids: [DEBUG_DEMO_IDS.familyGuardianId, DEBUG_DEMO_IDS.homeGuardianIds[2]],
  },
];

const demoScheduleParticipants = [
  {
    schedule_id: DEBUG_DEMO_IDS.familyScheduleIds[0],
    guardian_id: DEBUG_DEMO_IDS.familyGuardianId,
    dog_id: DEBUG_DEMO_IDS.dogIds.family,
    status: "accepted",
  },
  {
    schedule_id: DEBUG_DEMO_IDS.familyScheduleIds[1],
    guardian_id: DEBUG_DEMO_IDS.familyGuardianId,
    dog_id: DEBUG_DEMO_IDS.dogIds.family,
    status: "invited",
  },
];

async function upsertGuardianWithDog(supabase, guardian) {
  const { error: authErr } = await supabase.auth.admin.createUser({
    id: guardian.id,
    email: guardian.email,
    password: "password123",
    email_confirm: true,
  });
  if (authErr && !authErr.message.includes("already")) {
    throw new Error(`create auth user (${guardian.email}) failed: ${authErr.message}`);
  }

  const { error: userErr } = await supabase.from("users").upsert({
    id: guardian.id,
    email: guardian.email,
    trust_score: guardian.trust_score,
    trust_level: guardian.trust_level,
  });
  assertNoError(userErr, `upsert users (${guardian.email})`);

  const { error: guardianErr } = await supabase.from("guardians").upsert({
    id: guardian.id,
    user_id: guardian.id,
    nickname: guardian.nickname,
    bio: guardian.bio,
    address_name: guardian.address_name,
    verified_region: true,
    usage_purpose: ["friend", "care", "family"],
    onboarding_progress: 100,
    activity_times: guardian.activity_times,
  });
  assertNoError(guardianErr, `upsert guardian (${guardian.nickname})`);

  const { error: dogErr } = await supabase.from("dogs").upsert({
    id: guardian.dog.id,
    guardian_id: guardian.id,
    name: guardian.dog.name,
    breed: guardian.dog.breed,
    age: guardian.dog.age,
    weight_kg: guardian.dog.weight_kg,
    gender: guardian.dog.gender,
    neutered: true,
    temperament: guardian.dog.temperament,
    photo_urls: [],
  });
  assertNoError(dogErr, `upsert dog (${guardian.dog.name})`);

  const { error: locationErr } = await supabase.rpc("set_guardian_location", {
    p_guardian_id: guardian.id,
    p_lng: guardian.lng,
    p_lat: guardian.lat,
  });
  if (locationErr) {
    console.warn(`set_guardian_location warning (${guardian.nickname}): ${locationErr.message}`);
  }
}

async function seedDebugDemoFallback() {
  const supabase = await createAdminClient();

  console.log("Debug demo fallback seed started.");

  for (const guardian of [...homeGuardians, careGuardian, familyGuardian]) {
    await upsertGuardianWithDog(supabase, guardian);
    console.log(`- guardian ready: ${guardian.nickname}`);
  }

  const { error: placesErr } = await supabase.from("partner_places").upsert(demoPlaces);
  if (placesErr && !isMissingTableError(placesErr, "partner_places")) {
    assertNoError(placesErr, "upsert partner places");
  }

  const { error: reservationsErr } = await supabase.from("reservations").upsert(demoReservations);
  if (reservationsErr && !isMissingTableError(reservationsErr, "reservations")) {
    assertNoError(reservationsErr, "upsert reservations");
  }

  const { error: roomsErr } = await supabase.from("chat_rooms").upsert(demoRooms);
  assertNoError(roomsErr, "upsert chat rooms");

  const { error: chatParticipantsErr } = await supabase.from("chat_participants").upsert(
    [
      { room_id: DEBUG_DEMO_IDS.roomIds[0], guardian_id: DEBUG_DEMO_IDS.familyGuardianId },
      { room_id: DEBUG_DEMO_IDS.roomIds[0], guardian_id: DEBUG_DEMO_IDS.homeGuardianIds[0] },
      { room_id: DEBUG_DEMO_IDS.roomIds[1], guardian_id: DEBUG_DEMO_IDS.familyGuardianId },
      { room_id: DEBUG_DEMO_IDS.roomIds[1], guardian_id: DEBUG_DEMO_IDS.homeGuardianIds[2] },
    ],
    { onConflict: "room_id,guardian_id" }
  );
  assertNoError(chatParticipantsErr, "upsert chat participants");

  const { error: groupsErr } = await supabase.from("family_groups").upsert(demoGroups);
  assertNoError(groupsErr, "upsert family groups");

  const { error: membersErr } = await supabase
    .from("family_members")
    .upsert(demoGroupMembers, { onConflict: "group_id,member_id" });
  assertNoError(membersErr, "upsert family members");

  const { error: ownershipsErr } = await supabase
    .from("dog_ownership")
    .upsert(demoOwnerships, { onConflict: "dog_id,guardian_id" });
  if (ownershipsErr && !isMissingTableError(ownershipsErr, "dog_ownership")) {
    assertNoError(ownershipsErr, "upsert dog ownership");
  }

  const { error: schedulesErr } = await supabase.from("schedules").upsert(demoSchedules);
  assertNoError(schedulesErr, "upsert schedules");

  const { error: scheduleParticipantsErr } = await supabase
    .from("schedule_participants")
    .upsert(demoScheduleParticipants, { onConflict: "schedule_id,guardian_id" });
  if (scheduleParticipantsErr && !isMissingTableError(scheduleParticipantsErr, "schedule_participants")) {
    assertNoError(scheduleParticipantsErr, "upsert schedule participants");
  }

  console.log("Debug demo fallback seed completed.");
}

seedDebugDemoFallback().catch((error) => {
  console.error("[seed-debug-demo-fallback] failed:", error.message);
  process.exitCode = 1;
});
