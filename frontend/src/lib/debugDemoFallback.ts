import type { Database } from "@/types/database.types";

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
    dogIds: {
        home: [
            "00000000-0000-0000-0000-00000000b101",
            "00000000-0000-0000-0000-00000000b102",
            "00000000-0000-0000-0000-00000000b103",
        ],
        care: "00000000-0000-0000-0000-00000000b201",
        family: "00000000-0000-0000-0000-00000000b301",
    },
} as const;

export type PartnerPlace = Database["public"]["Tables"]["partner_places"]["Row"];
export type Reservation = Database["public"]["Tables"]["reservations"]["Row"];
export type FamilyGroup = Database["public"]["Tables"]["family_groups"]["Row"];
export type DogOwnership = Database["public"]["Tables"]["dog_ownership"]["Row"];
export type ScheduleParticipant = Database["public"]["Tables"]["schedule_participants"]["Row"];

export const DEBUG_DEMO_CARE_PLACES: PartnerPlace[] = [
    {
        id: DEBUG_DEMO_IDS.carePlaceIds[0],
        name: "성수 산책 라운지",
        category: "park",
        address_name: "성수동",
        location: null,
        description:
            "아침 산책 전에 만나기 좋은 조용한 코스예요. 물그릇과 그늘 벤치가 가까워서 첫 만남 장소로 많이들 쓰더라고요.",
        photo_urls: [],
        business_hours: null,
        is_verified: true,
        amenities: ["water", "shade", "parking"],
        created_at: "2026-03-01T09:00:00.000Z",
        updated_at: "2026-03-01T09:00:00.000Z",
    },
    {
        id: DEBUG_DEMO_IDS.carePlaceIds[1],
        name: "뚝섬 케어 스팟",
        category: "cafe",
        address_name: "뚝섬",
        location: null,
        description:
            "비 오는 날에도 인수인계하기 편한 실내 대기 장소예요. 짧게 브리핑하고 출발하기 좋습니다.",
        photo_urls: [],
        business_hours: null,
        is_verified: true,
        amenities: ["indoor", "rest area"],
        created_at: "2026-03-01T09:10:00.000Z",
        updated_at: "2026-03-01T09:10:00.000Z",
    },
];

export const DEBUG_DEMO_RESERVATIONS: Reservation[] = [
    {
        id: "00000000-0000-0000-0000-00000000c201",
        place_id: DEBUG_DEMO_IDS.carePlaceIds[0],
        guardian_id: DEBUG_DEMO_IDS.careGuardianId,
        dog_id: DEBUG_DEMO_IDS.dogIds.care,
        reserved_at: "2026-03-09T09:00:00.000Z",
        status: "pending",
        guest_count: 1,
        request_memo: "아침 9시에 코코 맡기고 싶어요. 낯가림이 조금 있어서 첫 5분만 천천히 인사 부탁드려요.",
        created_at: "2026-03-07T18:10:00.000Z",
    },
    {
        id: "00000000-0000-0000-0000-00000000c202",
        place_id: DEBUG_DEMO_IDS.carePlaceIds[1],
        guardian_id: DEBUG_DEMO_IDS.careGuardianId,
        dog_id: DEBUG_DEMO_IDS.dogIds.care,
        reserved_at: "2026-03-12T12:30:00.000Z",
        status: "confirmed",
        guest_count: 2,
        request_memo: "가족 한 명이 같이 가서 점심 전후로 인수인계할 예정이에요. 하네스는 초록색입니다.",
        created_at: "2026-03-08T12:00:00.000Z",
    },
];

export const DEBUG_DEMO_FAMILY_OWNERSHIPS: DogOwnership[] = [
    {
        dog_id: DEBUG_DEMO_IDS.dogIds.family,
        guardian_id: DEBUG_DEMO_IDS.familyGuardianId,
        role: "owner",
        is_primary: true,
        created_at: "2026-03-01T10:00:00.000Z",
    },
    {
        dog_id: DEBUG_DEMO_IDS.dogIds.home[0],
        guardian_id: DEBUG_DEMO_IDS.familyGuardianId,
        role: "co_owner",
        is_primary: false,
        created_at: "2026-03-01T10:05:00.000Z",
    },
];

export interface HomeDebugDemoPayload {
    profiles: import("@/components/features/match/types").MatchGuardianProfile[];
}

export interface CareDebugDemoPayload {
    places: PartnerPlace[];
    reservations: Reservation[];
}

export interface FamilyDebugDemoPayload {
    groups: FamilyGroup[];
    memberCounts: Record<string, number>;
    ownerships: DogOwnership[];
    dogs: Array<{ id: string; name: string }>;
    participants: ScheduleParticipant[];
    sharedSchedules: import("@/lib/hooks/useFamily").FamilySharedScheduleViewModel[];
}

export interface ModesDebugDemoPayload {
    partnerPlaces: PartnerPlace[];
    reservations: Reservation[];
    ownerships: DogOwnership[];
    participants: ScheduleParticipant[];
}

export function isDebugDemoFallbackEnabled() {
    return process.env.NODE_ENV !== "production";
}

export function shouldUseDebugCollectionFallback<T>({
    liveItems,
    isError,
    isLoading,
    demoItems,
}: {
    liveItems: T[] | null | undefined;
    isError: boolean;
    isLoading: boolean;
    demoItems: T[] | null | undefined;
}) {
    if (!isDebugDemoFallbackEnabled() || isLoading) return false;
    return (isError || (liveItems?.length ?? 0) === 0) && (demoItems?.length ?? 0) > 0;
}

export function hasDebugDemoData<T>(items: T[] | null | undefined) {
    return (items?.length ?? 0) > 0;
}

export function isDebugDemoMatchProfile(profileId: string) {
    return DEBUG_DEMO_IDS.homeGuardianIds.includes(profileId as (typeof DEBUG_DEMO_IDS.homeGuardianIds)[number]);
}
