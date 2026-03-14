import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { MatchGuardianProfile } from "@/components/features/match/types";
import {
    DEBUG_DEMO_CARE_PLACES,
    DEBUG_DEMO_FAMILY_OWNERSHIPS,
    DEBUG_DEMO_IDS,
    DEBUG_DEMO_RESERVATIONS,
    type CareDebugDemoPayload,
    type FamilyDebugDemoPayload,
    type HomeDebugDemoPayload,
    type ModesDebugDemoPayload,
} from "@/lib/debugDemoFallback";
import type { Database } from "@/types/database.types";

type Dog = Database["public"]["Tables"]["dogs"]["Row"];
type Guardian = Database["public"]["Tables"]["guardians"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];
type PartnerPlace = Database["public"]["Tables"]["partner_places"]["Row"];
type Reservation = Database["public"]["Tables"]["reservations"]["Row"];
type FamilyGroup = Database["public"]["Tables"]["family_groups"]["Row"];
type FamilyMember = Database["public"]["Tables"]["family_members"]["Row"];
type ScheduleParticipant = Database["public"]["Tables"]["schedule_participants"]["Row"];
type Schedule = Database["public"]["Tables"]["schedules"]["Row"];

function isSchemaCacheMiss(error: { message?: string } | null | undefined, tableName: string) {
    return error?.message?.includes(`Could not find the table 'public.${tableName}' in the schema cache`) ?? false;
}

function getAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) return null;

    return createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

async function loadHomePayload(): Promise<HomeDebugDemoPayload> {
    const supabase = getAdminClient();
    if (!supabase) return { profiles: [] };

    const { data, error } = await supabase
        .from("guardians")
        .select("*, users ( trust_score, trust_level ), dogs ( * )")
        .in("id", [...DEBUG_DEMO_IDS.homeGuardianIds]);

    if (error || !data) return { profiles: [] };

    const guardianMap = new Map<string, number>([
        [DEBUG_DEMO_IDS.homeGuardianIds[0], 0],
        [DEBUG_DEMO_IDS.homeGuardianIds[1], 1],
        [DEBUG_DEMO_IDS.homeGuardianIds[2], 2],
    ]);

    const profiles = (data as Array<
        Guardian & { users: Pick<User, "trust_score" | "trust_level"> | null; dogs: Dog[] }
    >)
        .sort((a, b) => (guardianMap.get(a.id) ?? 99) - (guardianMap.get(b.id) ?? 99))
        .map((guardian, index) => {
            const metrics = [
                { distance_meters: 480, compatibility_score: 93, time_overlap_score: 88 },
                { distance_meters: 860, compatibility_score: 87, time_overlap_score: 72 },
                { distance_meters: 1420, compatibility_score: 79, time_overlap_score: 61 },
            ][index] ?? { distance_meters: 1200, compatibility_score: 75, time_overlap_score: 55 };

            return {
                ...guardian,
                distance_meters: metrics.distance_meters,
                compatibility_score: metrics.compatibility_score,
                time_overlap_score: metrics.time_overlap_score,
            } as MatchGuardianProfile;
        });

    return { profiles };
}

async function loadCarePayload(): Promise<CareDebugDemoPayload> {
    const supabase = getAdminClient();
    if (!supabase) return { places: [], reservations: [] };

    const [{ data: places, error: placesError }, { data: reservations, error: reservationsError }] = await Promise.all([
        supabase
            .from("partner_places")
            .select("*")
            .in("id", [...DEBUG_DEMO_IDS.carePlaceIds])
            .order("created_at", { ascending: false }),
        supabase
            .from("reservations")
            .select("*")
            .eq("guardian_id", DEBUG_DEMO_IDS.careGuardianId)
            .order("reserved_at", { ascending: false }),
    ]);

    const reservationRows =
        !reservationsError && (reservations?.length ?? 0) > 0
            ? ((reservations ?? []) as Reservation[])
            : DEBUG_DEMO_RESERVATIONS.filter((reservation) => reservation.guardian_id === DEBUG_DEMO_IDS.careGuardianId);
    const placeIds = new Set([
        ...DEBUG_DEMO_IDS.carePlaceIds,
        ...reservationRows.map((reservation) => reservation.place_id),
    ]);
    const resolvedPlaces =
        !placesError && (places?.length ?? 0) > 0
            ? ((places ?? []) as PartnerPlace[])
            : DEBUG_DEMO_CARE_PLACES.filter((place) => placeIds.has(place.id));

    return {
        places: isSchemaCacheMiss(placesError, "partner_places") ? resolvedPlaces : placesError ? [] : resolvedPlaces,
        reservations: reservationRows,
    };
}

async function loadFamilyPayload(): Promise<FamilyDebugDemoPayload> {
    const supabase = getAdminClient();
    if (!supabase) {
        return {
            groups: [],
            memberCounts: {},
            ownerships: [],
            dogs: [],
            participants: [],
            sharedSchedules: [],
        };
    }

    const [
        { data: groups, error: groupsError },
        { data: members, error: membersError },
        { data: dogs, error: dogsError },
        { data: schedules, error: schedulesError },
    ] = await Promise.all([
        supabase
            .from("family_groups")
            .select("*")
            .in("id", [...DEBUG_DEMO_IDS.familyGroupIds])
            .order("created_at", { ascending: false }),
        supabase
            .from("family_members")
            .select("*")
            .in("group_id", [...DEBUG_DEMO_IDS.familyGroupIds]),
        supabase
            .from("dogs")
            .select("id,name,guardian_id")
            .in("guardian_id", [...DEBUG_DEMO_IDS.homeGuardianIds, DEBUG_DEMO_IDS.familyGuardianId]),
        supabase
            .from("schedules")
            .select("id,title,datetime,status,proposal_status,confirmed_at,created_at,participant_ids")
            .in("id", [...DEBUG_DEMO_IDS.familyScheduleIds]),
    ]);

    const memberCounts = new Map<string, number>();
    ((members ?? []) as FamilyMember[]).forEach((member) => {
        memberCounts.set(member.group_id, (memberCounts.get(member.group_id) ?? 0) + 1);
    });

    const dogRows = dogsError
        ? []
        : ((dogs ?? []) as Array<Pick<Dog, "id" | "name"> & { guardian_id: string }>).map((dog) => ({
              id: dog.id,
              name: dog.name,
              guardian_id: dog.guardian_id,
          }));

    const familyDog = dogRows.find((dog) => dog.guardian_id === DEBUG_DEMO_IDS.familyGuardianId);
    const schedulesForFamily = schedulesError
        ? []
        : ((schedules ?? []) as Array<
              Pick<
                  Schedule,
                  "id" | "title" | "datetime" | "status" | "proposal_status" | "confirmed_at" | "created_at" | "participant_ids"
              >
          >).filter((schedule) => schedule.participant_ids.includes(DEBUG_DEMO_IDS.familyGuardianId));

    const derivedParticipants: ScheduleParticipant[] = schedulesForFamily.map((schedule) => ({
        schedule_id: schedule.id,
        guardian_id: DEBUG_DEMO_IDS.familyGuardianId,
        dog_id: familyDog?.id ?? null,
        status:
            schedule.proposal_status === "accepted" || schedule.status === "confirmed"
                ? "accepted"
                : schedule.proposal_status === "rejected"
                  ? "declined"
                  : "invited",
        joined_at: schedule.confirmed_at ?? schedule.created_at,
    }));

    const sharedSchedules = schedulesForFamily.map((schedule) => {
        const participant = derivedParticipants.find((item) => item.schedule_id === schedule.id);
        return {
            schedule_id: schedule.id,
            participant_status: participant?.status ?? "invited",
            joined_at: participant?.joined_at ?? schedule.created_at,
            title: schedule.title,
            datetime: schedule.datetime,
            schedule_status: schedule.status,
        };
    });

    return {
        groups: groupsError ? [] : ((groups ?? []) as FamilyGroup[]),
        memberCounts: membersError ? {} : Object.fromEntries(memberCounts.entries()),
        ownerships: DEBUG_DEMO_FAMILY_OWNERSHIPS,
        dogs: dogRows.map((dog) => ({ id: dog.id, name: dog.name })),
        participants: derivedParticipants,
        sharedSchedules: schedulesError ? [] : sharedSchedules,
    };
}

async function loadModesPayload(): Promise<ModesDebugDemoPayload> {
    const care = await loadCarePayload();
    const family = await loadFamilyPayload();

    return {
        partnerPlaces: care.places,
        reservations: care.reservations,
        ownerships: family.ownerships,
        participants: family.participants,
    };
}

export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ message: "not found" }, { status: 404 });
    }

    const surface = request.nextUrl.searchParams.get("surface");

    if (surface === "home") {
        return NextResponse.json(await loadHomePayload());
    }
    if (surface === "care") {
        return NextResponse.json(await loadCarePayload());
    }
    if (surface === "family") {
        return NextResponse.json(await loadFamilyPayload());
    }
    if (surface === "modes") {
        return NextResponse.json(await loadModesPayload());
    }

    return NextResponse.json({ message: "invalid surface" }, { status: 400 });
}
