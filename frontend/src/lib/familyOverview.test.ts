// File: Unit tests for family overview ownership mapping and participant metrics.
import { describe, expect, it } from "vitest";
import {
    mapDogOwnershipsWithDogName,
    summarizeFamilyParticipants,
} from "@/lib/familyOverview";

describe("familyOverview utilities", () => {
    it("maps ownership rows to dog names", () => {
        const viewModels = mapDogOwnershipsWithDogName(
            [
                {
                    dog_id: "dog-1",
                    guardian_id: "guardian-1",
                    role: "owner",
                    is_primary: true,
                    created_at: "2026-03-06T00:00:00.000Z",
                },
            ],
            [{ id: "dog-1", name: "우주" }]
        );

        expect(viewModels).toEqual([
            {
                dogId: "dog-1",
                dogName: "우주",
                role: "owner",
                isPrimary: true,
            },
        ]);
    });

    it("falls back to unknown name when dog id is missing", () => {
        const viewModels = mapDogOwnershipsWithDogName(
            [
                {
                    dog_id: "dog-missing",
                    guardian_id: "guardian-1",
                    role: "co_owner",
                    is_primary: false,
                    created_at: "2026-03-06T00:00:00.000Z",
                },
            ],
            []
        );

        expect(viewModels[0]?.dogName).toBe("알 수 없는 반려견");
    });

    it("summarizes participant status counts", () => {
        const metrics = summarizeFamilyParticipants([
            {
                schedule_id: "schedule-1",
                guardian_id: "guardian-1",
                dog_id: null,
                status: "accepted",
                joined_at: "2026-03-06T10:00:00.000Z",
            },
            {
                schedule_id: "schedule-2",
                guardian_id: "guardian-1",
                dog_id: null,
                status: "invited",
                joined_at: "2026-03-06T11:00:00.000Z",
            },
            {
                schedule_id: "schedule-3",
                guardian_id: "guardian-1",
                dog_id: null,
                status: "declined",
                joined_at: "2026-03-06T12:00:00.000Z",
            },
        ]);

        expect(metrics).toEqual({
            total: 3,
            invited: 1,
            accepted: 1,
            declined: 1,
        });
    });
});
