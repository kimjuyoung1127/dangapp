// File: Schedule hooks for list retrieval and schedule creation from chat flow.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type Schedule = Database["public"]["Tables"]["schedules"]["Row"];
type ScheduleInsert = Database["public"]["Tables"]["schedules"]["Insert"];

export interface ScheduleWithPartner extends Schedule {
    partnerName: string;
    partnerGuardianId: string;
}

export interface CreateScheduleInput {
    room_id: string;
    organizer_id: string;
    title: string;
    datetime: string;
    participant_ids: string[];
    location_name?: string | null;
    place_detail?: string | null;
    status?: ScheduleInsert["status"];
    proposal_status?: ScheduleInsert["proposal_status"];
    confirmed_at?: string | null;
}

export interface RespondScheduleInput {
    schedule_id: string;
    proposal_status: "accepted" | "rejected";
}

export type RespondScheduleErrorCode = "ALREADY_RESPONDED" | "FORBIDDEN" | "UNKNOWN";

export interface RespondScheduleSuccess {
    ok: true;
    data: Schedule;
}

export interface RespondScheduleFailure {
    ok: false;
    code: RespondScheduleErrorCode;
    message: string;
}

export type RespondScheduleResult = RespondScheduleSuccess | RespondScheduleFailure;

interface RespondScheduleApiError {
    code?: string | null;
    message?: string | null;
    status?: number | string;
}

const RESPOND_SCHEDULE_ERROR_MESSAGES: Record<RespondScheduleErrorCode, string> = {
    ALREADY_RESPONDED: "이미 응답 처리된 약속입니다.",
    FORBIDDEN: "이 약속에 응답할 권한이 없습니다.",
    UNKNOWN: "약속 응답 처리에 실패했습니다. 잠시 후 다시 시도해주세요.",
};

function parseErrorStatus(error: RespondScheduleApiError | null): number | null {
    if (!error || error.status === undefined || error.status === null) return null;
    if (typeof error.status === "number") return error.status;
    const numeric = Number.parseInt(error.status, 10);
    return Number.isFinite(numeric) ? numeric : null;
}

function mapRespondScheduleErrorCode(
    error: RespondScheduleApiError | null,
    rows: Schedule[] | null
): RespondScheduleErrorCode {
    if (!error && (!rows || rows.length === 0)) return "ALREADY_RESPONDED";
    if (!error) return "UNKNOWN";

    const status = parseErrorStatus(error);
    const code = error.code ?? "";
    const message = error.message ?? "";

    if (status === 406 || code === "PGRST116") return "ALREADY_RESPONDED";
    if (message.includes("이미 응답")) return "ALREADY_RESPONDED";
    if (status === 401 || status === 403 || code === "42501") return "FORBIDDEN";
    return "UNKNOWN";
}

export function resolveRespondScheduleResult(params: {
    data: Schedule[] | null;
    error: RespondScheduleApiError | null;
}): RespondScheduleResult {
    if (params.error) {
        const code = mapRespondScheduleErrorCode(params.error, params.data);
        return { ok: false, code, message: RESPOND_SCHEDULE_ERROR_MESSAGES[code] };
    }

    if (!params.data || params.data.length === 0) {
        const code: RespondScheduleErrorCode = "ALREADY_RESPONDED";
        return { ok: false, code, message: RESPOND_SCHEDULE_ERROR_MESSAGES[code] };
    }

    return {
        ok: true,
        data: params.data[0] as Schedule,
    };
}

export class RespondScheduleMutationError extends Error {
    code: RespondScheduleErrorCode;

    constructor(result: RespondScheduleFailure) {
        super(result.message);
        this.name = "RespondScheduleMutationError";
        this.code = result.code;
    }
}

export function useMySchedules(guardianId: string | undefined) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["my-schedules", guardianId],
        queryFn: async () => {
            if (!guardianId) return [];

            const { data: asOrganizer, error: organizerError } = await supabase
                .from("schedules")
                .select("*")
                .eq("organizer_id", guardianId)
                .order("datetime", { ascending: false });

            if (organizerError) throw organizerError;

            const { data: asParticipant, error: participantError } = await supabase
                .from("schedules")
                .select("*")
                .contains("participant_ids", [guardianId])
                .neq("organizer_id", guardianId)
                .order("datetime", { ascending: false });

            if (participantError) throw participantError;

            const allSchedules = [...(asOrganizer ?? []), ...(asParticipant ?? [])];
            const uniqueMap = new Map<string, Schedule>();
            for (const schedule of allSchedules) {
                uniqueMap.set(schedule.id, schedule);
            }
            const schedules = Array.from(uniqueMap.values());

            const partnerIdMap = new Map<string, string | null>();
            const partnerIdSet = new Set<string>();

            for (const schedule of schedules) {
                let partnerId: string | null = null;
                if (schedule.organizer_id === guardianId) {
                    partnerId = schedule.participant_ids.find((id) => id !== guardianId) ?? null;
                } else {
                    partnerId = schedule.organizer_id;
                }

                partnerIdMap.set(schedule.id, partnerId);
                if (partnerId) partnerIdSet.add(partnerId);
            }

            const nameMap = new Map<string, string>();
            const partnerIds = Array.from(partnerIdSet);
            if (partnerIds.length > 0) {
                const { data: partners } = await supabase
                    .from("guardians")
                    .select("id, nickname")
                    .in("id", partnerIds);

                for (const partner of partners ?? []) {
                    nameMap.set(partner.id, partner.nickname);
                }
            }

            const results: ScheduleWithPartner[] = schedules.map((schedule) => {
                const partnerId = partnerIdMap.get(schedule.id) ?? null;
                return {
                    ...schedule,
                    partnerName: partnerId ? (nameMap.get(partnerId) ?? "알 수 없음") : "알 수 없음",
                    partnerGuardianId: partnerId ?? "",
                };
            });

            results.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
            return results;
        },
        enabled: !!guardianId,
    });
}

export function useCreateSchedule() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateScheduleInput) => {
            const { data, error } = await supabase
                .from("schedules")
                .insert({
                    room_id: input.room_id,
                    organizer_id: input.organizer_id,
                    title: input.title,
                    datetime: input.datetime,
                    participant_ids: input.participant_ids,
                    location_name: input.location_name ?? null,
                    place_detail: input.place_detail ?? null,
                    status: input.status ?? "proposed",
                    proposal_status: input.proposal_status ?? "proposed",
                    confirmed_at: input.confirmed_at ?? null,
                })
                .select()
                .single();

            if (error) throw error;
            return data as Schedule;
        },
        onSuccess: (_created, variables) => {
            queryClient.invalidateQueries({ queryKey: ["my-schedules"] });
            queryClient.invalidateQueries({ queryKey: ["chat-messages", variables.room_id] });
        },
    });
}

export function useRespondSchedule() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: RespondScheduleInput) => {
            const nextStatus = input.proposal_status === "accepted" ? "confirmed" : "cancelled";
            const nextConfirmedAt =
                input.proposal_status === "accepted" ? new Date().toISOString() : null;

            const { data, error } = await supabase
                .from("schedules")
                .update({
                    proposal_status: input.proposal_status,
                    status: nextStatus,
                    confirmed_at: nextConfirmedAt,
                })
                .eq("id", input.schedule_id)
                .eq("proposal_status", "proposed")
                .select()
                .limit(1);

            const result = resolveRespondScheduleResult({
                data: (data as Schedule[] | null) ?? null,
                error: error as RespondScheduleApiError | null,
            });

            if (!result.ok) {
                throw new RespondScheduleMutationError(result);
            }

            return result.data;
        },
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ["my-schedules"] });
            queryClient.invalidateQueries({ queryKey: ["chat-messages", updated.room_id] });
        },
    });
}
