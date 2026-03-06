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

            if (error) throw error;
            if (!data || data.length === 0) {
                throw new Error("이미 응답 처리된 약속입니다.");
            }
            return data[0] as Schedule;
        },
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ["my-schedules"] });
            queryClient.invalidateQueries({ queryKey: ["chat-messages", updated.room_id] });
        },
    });
}
