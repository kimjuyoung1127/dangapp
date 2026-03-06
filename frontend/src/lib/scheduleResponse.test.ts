// File: Unit tests for schedule response metadata parsing and actionability rules.
import { describe, expect, it } from "vitest";
import type { ChatMessage } from "@/components/features/chat/types";
import {
    buildScheduleResponseMap,
    getScheduleResponseState,
    isScheduleResponseActionable,
} from "@/lib/scheduleResponse";

function message(overrides: Partial<ChatMessage>): ChatMessage {
    return {
        id: "msg-id",
        room_id: "room-id",
        sender_id: "guardian-1",
        type: "system",
        content: null,
        metadata: null,
        read_by: null,
        created_at: "2026-03-06T00:00:00.000Z",
        ...overrides,
    };
}

describe("buildScheduleResponseMap", () => {
    it("returns empty map when no messages exist", () => {
        expect(buildScheduleResponseMap([]).size).toBe(0);
    });

    it("maps accepted by proposalStatus", () => {
        const map = buildScheduleResponseMap([
            message({
                metadata: { scheduleId: "s1", proposalStatus: "accepted" },
            }),
        ]);

        expect(getScheduleResponseState(map, "s1")).toBe("accepted");
    });

    it("maps rejected by proposalStatus", () => {
        const map = buildScheduleResponseMap([
            message({
                metadata: { scheduleId: "s1", proposalStatus: "rejected" },
            }),
        ]);

        expect(getScheduleResponseState(map, "s1")).toBe("rejected");
    });

    it("maps accepted by legacy status confirmed", () => {
        const map = buildScheduleResponseMap([
            message({
                metadata: { scheduleId: "s1", status: "confirmed" },
            }),
        ]);

        expect(getScheduleResponseState(map, "s1")).toBe("accepted");
    });

    it("maps rejected by legacy status cancelled", () => {
        const map = buildScheduleResponseMap([
            message({
                metadata: { scheduleId: "s1", status: "cancelled" },
            }),
        ]);

        expect(getScheduleResponseState(map, "s1")).toBe("rejected");
    });

    it("ignores proposed status", () => {
        const map = buildScheduleResponseMap([
            message({
                metadata: { scheduleId: "s1", status: "proposed" },
            }),
        ]);

        expect(getScheduleResponseState(map, "s1")).toBe("none");
    });

    it("ignores records without scheduleId", () => {
        const map = buildScheduleResponseMap([
            message({
                metadata: { proposalStatus: "accepted" },
            }),
            message({
                metadata: { scheduleId: 12345, proposalStatus: "accepted" },
            }),
        ]);

        expect(map.size).toBe(0);
    });

    it("uses the last matching message in order", () => {
        const map = buildScheduleResponseMap([
            message({ metadata: { scheduleId: "s1", proposalStatus: "accepted" } }),
            message({ metadata: { scheduleId: "s1", proposalStatus: "rejected" } }),
        ]);

        expect(getScheduleResponseState(map, "s1")).toBe("rejected");
    });
});

describe("isScheduleResponseActionable", () => {
    it("returns true only for partner schedule messages that are still open", () => {
        expect(
            isScheduleResponseActionable({
                isMyMessage: false,
                scheduleId: "s1",
                responseState: "none",
                pendingScheduleId: null,
            })
        ).toBe(true);
    });

    it("returns false for own message, missing id, already responded, or pending", () => {
        expect(
            isScheduleResponseActionable({
                isMyMessage: true,
                scheduleId: "s1",
                responseState: "none",
                pendingScheduleId: null,
            })
        ).toBe(false);

        expect(
            isScheduleResponseActionable({
                isMyMessage: false,
                scheduleId: null,
                responseState: "none",
                pendingScheduleId: null,
            })
        ).toBe(false);

        expect(
            isScheduleResponseActionable({
                isMyMessage: false,
                scheduleId: "s1",
                responseState: "accepted",
                pendingScheduleId: null,
            })
        ).toBe(false);

        expect(
            isScheduleResponseActionable({
                isMyMessage: false,
                scheduleId: "s1",
                responseState: "none",
                pendingScheduleId: "s1",
            })
        ).toBe(false);
    });
});
