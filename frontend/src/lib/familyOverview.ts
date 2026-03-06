// File: Family overview utility helpers for ownership mapping and participant metrics.
import type { Database } from "@/types/database.types";

type Dog = Database["public"]["Tables"]["dogs"]["Row"];
type DogOwnership = Database["public"]["Tables"]["dog_ownership"]["Row"];
type ScheduleParticipant = Database["public"]["Tables"]["schedule_participants"]["Row"];

export interface FamilyDogOwnershipViewModel {
    dogId: string;
    dogName: string;
    role: DogOwnership["role"];
    isPrimary: boolean;
}

export interface FamilyParticipantMetrics {
    total: number;
    invited: number;
    accepted: number;
    declined: number;
}

export function mapDogOwnershipsWithDogName(
    ownerships: DogOwnership[],
    dogs: Pick<Dog, "id" | "name">[]
): FamilyDogOwnershipViewModel[] {
    const dogNameMap = new Map(dogs.map((dog) => [dog.id, dog.name]));

    return ownerships.map((ownership) => ({
        dogId: ownership.dog_id,
        dogName: dogNameMap.get(ownership.dog_id) ?? "알 수 없는 반려견",
        role: ownership.role,
        isPrimary: ownership.is_primary,
    }));
}

export function summarizeFamilyParticipants(
    participants: ScheduleParticipant[]
): FamilyParticipantMetrics {
    return participants.reduce<FamilyParticipantMetrics>(
        (acc, participant) => {
            acc.total += 1;

            if (participant.status === "invited") acc.invited += 1;
            if (participant.status === "accepted") acc.accepted += 1;
            if (participant.status === "declined") acc.declined += 1;

            return acc;
        },
        {
            total: 0,
            invited: 0,
            accepted: 0,
            declined: 0,
        }
    );
}
