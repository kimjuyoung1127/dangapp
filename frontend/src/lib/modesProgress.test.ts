// File: Unit tests for care/family mode progress summary helpers.
import { describe, expect, it } from "vitest";
import {
    getProgressToneClasses,
    summarizeCareProgress,
    summarizeFamilyProgress,
} from "@/lib/modesProgress";

describe("modesProgress helpers", () => {
    it("marks care as warning when no partner place exists", () => {
        const summary = summarizeCareProgress({
            hasError: false,
            placesCount: 0,
            reservationsCount: 0,
            pendingReservationsCount: 0,
        });

        expect(summary).toEqual({
            title: "주의",
            tone: "warning",
            message: "연결된 파트너 장소가 없어 예약 생성이 제한됩니다.",
        });
    });

    it("marks care as good when pending reservations exist", () => {
        const summary = summarizeCareProgress({
            hasError: false,
            placesCount: 2,
            reservationsCount: 5,
            pendingReservationsCount: 1,
        });

        expect(summary.tone).toBe("good");
        expect(summary.title).toBe("활성");
    });

    it("marks family as neutral when no ownership and participants", () => {
        const summary = summarizeFamilyProgress({
            hasError: false,
            ownershipCount: 0,
            participantsCount: 0,
            acceptedParticipantsCount: 0,
        });

        expect(summary.tone).toBe("neutral");
        expect(summary.title).toBe("진행중");
    });

    it("returns tone classes for warning", () => {
        expect(getProgressToneClasses("warning")).toContain("text-red-700");
    });
});
