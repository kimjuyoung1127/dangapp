// File: Unit tests for care reservation mapping and create-input validation.
import { describe, expect, it } from "vitest";
import {
    mapReservationsWithPlaceName,
    toPartnerPlaceViewModels,
    validateCreateReservationInput,
} from "@/lib/careReservations";

describe("careReservations utilities", () => {
    it("maps partner places to view models", () => {
        const places = [
            {
                id: "place-1",
                name: "서울숲 3번 출입구",
                category: "walk",
                address_name: "서울 성동구",
                description: "산책 모임 장소",
                amenities: ["주차", "급수대"],
                is_verified: true,
                location: null,
                photo_urls: [],
                business_hours: null,
                created_at: "2026-03-06T00:00:00.000Z",
                updated_at: "2026-03-06T00:00:00.000Z",
            },
        ];

        const result = toPartnerPlaceViewModels(places as Parameters<typeof toPartnerPlaceViewModels>[0]);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("place-1");
        expect(result[0].isVerified).toBe(true);
    });

    it("maps reservation place names and handles missing place ids", () => {
        const places = [
            {
                id: "place-1",
                name: "서울숲 3번 출입구",
                category: "walk",
                address_name: null,
                description: null,
                amenities: [],
                is_verified: true,
                location: null,
                photo_urls: [],
                business_hours: null,
                created_at: "2026-03-06T00:00:00.000Z",
                updated_at: "2026-03-06T00:00:00.000Z",
            },
        ];
        const reservations = [
            {
                id: "res-1",
                place_id: "place-1",
                guardian_id: "g1",
                dog_id: null,
                reserved_at: "2026-03-07T09:30:00.000Z",
                status: "pending",
                guest_count: 1,
                request_memo: null,
                created_at: "2026-03-06T00:00:00.000Z",
            },
            {
                id: "res-2",
                place_id: "missing-place",
                guardian_id: "g1",
                dog_id: null,
                reserved_at: "2026-03-07T10:30:00.000Z",
                status: "pending",
                guest_count: 1,
                request_memo: null,
                created_at: "2026-03-06T00:00:00.000Z",
            },
        ];

        const result = mapReservationsWithPlaceName(
            reservations as Parameters<typeof mapReservationsWithPlaceName>[0],
            places as Parameters<typeof mapReservationsWithPlaceName>[1]
        );

        expect(result).toHaveLength(2);
        expect(result[0].placeName).toBe("서울숲 3번 출입구");
        expect(result[1].placeName).toBe("알 수 없는 장소");
    });

    it("keeps reservation mapping empty for empty data", () => {
        expect(mapReservationsWithPlaceName([], [])).toEqual([]);
    });

    it("validates required reservation input fields", () => {
        expect(validateCreateReservationInput({})).toMatchObject({ ok: false });
        expect(
            validateCreateReservationInput({
                guardian_id: "g1",
                place_id: "p1",
                reserved_at: "2026-03-07T18:30",
                guest_count: 1,
            })
        ).toMatchObject({ ok: true });
    });

    it("rejects invalid guest_count and datetime", () => {
        expect(
            validateCreateReservationInput({
                guardian_id: "g1",
                place_id: "p1",
                reserved_at: "invalid-date",
                guest_count: 1,
            })
        ).toMatchObject({ ok: false });

        expect(
            validateCreateReservationInput({
                guardian_id: "g1",
                place_id: "p1",
                reserved_at: "2026-03-07T18:30",
                guest_count: 0,
            })
        ).toMatchObject({ ok: false });
    });
});
