// File: Utilities for deriving schedule response state from chat message metadata.
import type { ChatMessage } from "@/components/features/chat/types";

export type ScheduleResponseState = "accepted" | "rejected" | "none";
type ResolvedScheduleResponseState = Exclude<ScheduleResponseState, "none">;

function resolveStateFromMetadata(metadata: Record<string, unknown> | null): ScheduleResponseState {
    if (!metadata) return "none";

    const proposalStatus =
        typeof metadata.proposalStatus === "string" ? metadata.proposalStatus : null;
    if (proposalStatus === "accepted") return "accepted";
    if (proposalStatus === "rejected") return "rejected";

    // Legacy schedule system messages can carry only status.
    const status = typeof metadata.status === "string" ? metadata.status : null;
    if (status === "confirmed") return "accepted";
    if (status === "cancelled") return "rejected";

    return "none";
}

export function buildScheduleResponseMap(
    messages: Array<Pick<ChatMessage, "type" | "metadata">>
): Map<string, ResolvedScheduleResponseState> {
    const map = new Map<string, ResolvedScheduleResponseState>();

    for (const message of messages) {
        if (message.type !== "system") continue;

        const metadata = (message.metadata as Record<string, unknown> | null) ?? null;
        const scheduleId = typeof metadata?.scheduleId === "string" ? metadata.scheduleId : null;
        if (!scheduleId) continue;

        const state = resolveStateFromMetadata(metadata);
        if (state === "none") continue;

        map.set(scheduleId, state);
    }

    return map;
}

export function getScheduleResponseState(
    responseById: ReadonlyMap<string, ResolvedScheduleResponseState>,
    scheduleId: string | null | undefined
): ScheduleResponseState {
    if (!scheduleId) return "none";
    return responseById.get(scheduleId) ?? "none";
}

export function isScheduleResponseActionable(params: {
    isMyMessage: boolean;
    scheduleId: string | null;
    responseState: ScheduleResponseState;
    pendingScheduleId: string | null;
}) {
    if (params.isMyMessage) return false;
    if (!params.scheduleId) return false;
    if (params.responseState !== "none") return false;
    if (params.pendingScheduleId === params.scheduleId) return false;
    return true;
}
