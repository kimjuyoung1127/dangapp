// File: Family hooks for group compatibility plus ownership/participant data binding.
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

export {
    useFamilyGroups,
    useCreateFamilyGroup,
    useAddFamilyMember,
    useFamilyMembers,
} from "@/lib/hooks/useMode";

type DogOwnership = Database["public"]["Tables"]["dog_ownership"]["Row"];
type ScheduleParticipant = Database["public"]["Tables"]["schedule_participants"]["Row"];
type Schedule = Database["public"]["Tables"]["schedules"]["Row"];

export interface FamilySharedScheduleViewModel {
    schedule_id: string;
    participant_status: ScheduleParticipant["status"];
    joined_at: string;
    title: string;
    datetime: string;
    schedule_status: Schedule["status"];
}

const familyOwnershipsKey = (guardianId: string) =>
    ["family-dog-ownerships", guardianId] as const;
const familyScheduleParticipantsKey = (guardianId: string) =>
    ["family-schedule-participants", guardianId] as const;
const familySharedSchedulesKey = (guardianId: string) =>
    ["family-shared-schedules", guardianId] as const;

export function useDogOwnerships(guardianId: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: familyOwnershipsKey(guardianId),
        queryFn: async () => {
            if (!guardianId) return [] as DogOwnership[];

            const { data, error } = await supabase
                .from("dog_ownership")
                .select("*")
                .eq("guardian_id", guardianId)
                .order("created_at", { ascending: true });

            if (error) throw error;
            return (data ?? []) as DogOwnership[];
        },
        enabled: !!guardianId,
        staleTime: 30 * 1000,
        placeholderData: (previousData) => previousData,
        refetchOnWindowFocus: false,
    });
}

export function useMyScheduleParticipants(guardianId: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: familyScheduleParticipantsKey(guardianId),
        queryFn: async () => {
            if (!guardianId) return [] as ScheduleParticipant[];

            const { data, error } = await supabase
                .from("schedule_participants")
                .select("*")
                .eq("guardian_id", guardianId)
                .order("joined_at", { ascending: false });

            if (error) throw error;
            return (data ?? []) as ScheduleParticipant[];
        },
        enabled: !!guardianId,
        staleTime: 20 * 1000,
        placeholderData: (previousData) => previousData,
        refetchOnWindowFocus: false,
    });
}

export function useFamilySharedSchedules(guardianId: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: familySharedSchedulesKey(guardianId),
        queryFn: async () => {
            if (!guardianId) return [] as FamilySharedScheduleViewModel[];

            const { data: participants, error: participantError } = await supabase
                .from("schedule_participants")
                .select("*")
                .eq("guardian_id", guardianId)
                .order("joined_at", { ascending: false })
                .limit(20);

            if (participantError) throw participantError;
            const participantRows = (participants ?? []) as ScheduleParticipant[];
            if (participantRows.length === 0) return [] as FamilySharedScheduleViewModel[];

            const scheduleIds = Array.from(new Set(participantRows.map((row) => row.schedule_id)));

            const { data: schedules, error: scheduleError } = await supabase
                .from("schedules")
                .select("id,title,datetime,status")
                .in("id", scheduleIds);

            if (scheduleError) throw scheduleError;

            const scheduleMap = new Map(
                ((schedules ?? []) as Pick<Schedule, "id" | "title" | "datetime" | "status">[]).map(
                    (schedule) => [schedule.id, schedule]
                )
            );

            return participantRows
                .map((participant) => {
                    const schedule = scheduleMap.get(participant.schedule_id);
                    if (!schedule) return null;

                    return {
                        schedule_id: participant.schedule_id,
                        participant_status: participant.status,
                        joined_at: participant.joined_at,
                        title: schedule.title,
                        datetime: schedule.datetime,
                        schedule_status: schedule.status,
                    } as FamilySharedScheduleViewModel;
                })
                .filter(
                    (item): item is FamilySharedScheduleViewModel => item !== null
                );
        },
        enabled: !!guardianId,
        staleTime: 20 * 1000,
        placeholderData: (previousData) => previousData,
        refetchOnWindowFocus: false,
    });
}
