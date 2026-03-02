// useSchedule.ts — 약속 목록 조회 훅 (DANG-WLK-001)

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type Schedule = Database["public"]["Tables"]["schedules"]["Row"];

export interface ScheduleWithPartner extends Schedule {
    partnerName: string;
    partnerGuardianId: string;
}

/** 내가 참여한 약속 목록 (organizer 또는 participant) */
export function useMySchedules(guardianId: string | undefined) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["my-schedules", guardianId],
        queryFn: async () => {
            if (!guardianId) return [];

            // organizer_id가 나이거나 participant_ids에 포함된 약속
            const { data: asOrganizer, error: e1 } = await supabase
                .from("schedules")
                .select("*")
                .eq("organizer_id", guardianId)
                .order("datetime", { ascending: false });

            if (e1) throw e1;

            const { data: asParticipant, error: e2 } = await supabase
                .from("schedules")
                .select("*")
                .contains("participant_ids", [guardianId])
                .neq("organizer_id", guardianId)
                .order("datetime", { ascending: false });

            if (e2) throw e2;

            // 합치고 중복 제거
            const allSchedules = [...(asOrganizer ?? []), ...(asParticipant ?? [])];
            const uniqueMap = new Map<string, Schedule>();
            for (const s of allSchedules) {
                uniqueMap.set(s.id, s);
            }
            const schedules = Array.from(uniqueMap.values());

            // 상대방 이름 조회
            const results: ScheduleWithPartner[] = [];

            for (const schedule of schedules) {
                // 상대방 ID: organizer가 아닌 participant, 또는 내가 organizer면 participant 중 첫 번째
                let partnerId: string | null = null;
                if (schedule.organizer_id === guardianId) {
                    partnerId = schedule.participant_ids.find((id) => id !== guardianId) ?? null;
                } else {
                    partnerId = schedule.organizer_id;
                }

                let partnerName = "알 수 없음";
                if (partnerId) {
                    const { data: partner } = await supabase
                        .from("guardians")
                        .select("nickname")
                        .eq("id", partnerId)
                        .single();
                    partnerName = partner?.nickname ?? "알 수 없음";
                }

                results.push({
                    ...schedule,
                    partnerName,
                    partnerGuardianId: partnerId ?? "",
                });
            }

            // 최신순 정렬
            results.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
            return results;
        },
        enabled: !!guardianId,
    });
}
