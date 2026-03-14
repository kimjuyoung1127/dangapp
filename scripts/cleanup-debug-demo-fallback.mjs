import {
  DEBUG_DEMO_IDS,
  assertNoError,
  createAdminClient,
  isMissingTableError,
} from "./debug-demo-fallback-common.mjs";

async function cleanupDebugDemoFallback() {
  const supabase = await createAdminClient();

  console.log("Debug demo fallback cleanup started.");

  const guardianIds = [
    ...DEBUG_DEMO_IDS.homeGuardianIds,
    DEBUG_DEMO_IDS.careGuardianId,
    DEBUG_DEMO_IDS.familyGuardianId,
  ];
  const dogIds = [
    ...DEBUG_DEMO_IDS.dogIds.home,
    DEBUG_DEMO_IDS.dogIds.care,
    DEBUG_DEMO_IDS.dogIds.family,
  ];

  let result = await supabase
    .from("schedule_participants")
    .delete()
    .in("schedule_id", [...DEBUG_DEMO_IDS.familyScheduleIds]);
  if (result.error && !isMissingTableError(result.error, "schedule_participants")) {
    assertNoError(result.error, "delete schedule participants");
  }

  result = await supabase.from("schedules").delete().in("id", [...DEBUG_DEMO_IDS.familyScheduleIds]);
  assertNoError(result.error, "delete schedules");

  result = await supabase.from("chat_participants").delete().in("room_id", [...DEBUG_DEMO_IDS.roomIds]);
  assertNoError(result.error, "delete chat participants");

  result = await supabase.from("chat_rooms").delete().in("id", [...DEBUG_DEMO_IDS.roomIds]);
  assertNoError(result.error, "delete chat rooms");

  result = await supabase
    .from("family_members")
    .delete()
    .in("group_id", [...DEBUG_DEMO_IDS.familyGroupIds]);
  assertNoError(result.error, "delete family members");

  result = await supabase
    .from("family_groups")
    .delete()
    .in("id", [...DEBUG_DEMO_IDS.familyGroupIds]);
  assertNoError(result.error, "delete family groups");

  result = await supabase
    .from("dog_ownership")
    .delete()
    .in("guardian_id", [DEBUG_DEMO_IDS.familyGuardianId]);
  if (result.error && !isMissingTableError(result.error, "dog_ownership")) {
    assertNoError(result.error, "delete dog ownership");
  }

  result = await supabase
    .from("reservations")
    .delete()
    .in("id", [...DEBUG_DEMO_IDS.reservationIds]);
  if (result.error && !isMissingTableError(result.error, "reservations")) {
    assertNoError(result.error, "delete reservations");
  }

  result = await supabase
    .from("partner_places")
    .delete()
    .in("id", [...DEBUG_DEMO_IDS.carePlaceIds]);
  if (result.error && !isMissingTableError(result.error, "partner_places")) {
    assertNoError(result.error, "delete partner places");
  }

  result = await supabase.from("dogs").delete().in("id", dogIds);
  assertNoError(result.error, "delete dogs");

  result = await supabase.from("guardians").delete().in("id", guardianIds);
  assertNoError(result.error, "delete guardians");

  result = await supabase.from("users").delete().in("id", guardianIds);
  assertNoError(result.error, "delete users");

  for (const guardianId of guardianIds) {
    const { error } = await supabase.auth.admin.deleteUser(guardianId);
    if (error && !error.message.toLowerCase().includes("user not found")) {
      throw new Error(`delete auth user (${guardianId}) failed: ${error.message}`);
    }
  }

  console.log("Debug demo fallback cleanup completed.");
}

cleanupDebugDemoFallback().catch((error) => {
  console.error("[cleanup-debug-demo-fallback] failed:", error.message);
  process.exitCode = 1;
});
