// useMatch.ts — 매칭 추천 + Like/Pass 액션 훅 (DANG-MAT-001)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { MatchGuardianProfile } from "@/components/features/match/types";

interface UseMatchingGuardiansOptions {
    guardianId: string;
    mode?: "basic" | "care" | "family";
    enabled?: boolean;
}

export function useMatchingGuardians({
    guardianId,
    mode,
    enabled = true,
}: UseMatchingGuardiansOptions) {
    const supabase = createClient();

    return useQuery<MatchGuardianProfile[]>({
        queryKey: ["matching-guardians", guardianId, mode],
        queryFn: async () => {
            // 1. RPC v2 호출: 추천 보호자 리스트
            const { data: matchedResults, error: rpcError } = await supabase.rpc(
                "match_guardians_v2",
                {
                    p_guardian_id: guardianId,
                    p_mode: mode ?? "basic",
                    p_limit: 30,
                }
            );

            if (rpcError) throw rpcError;
            if (!matchedResults || matchedResults.length === 0) return [];

            // 2. 매칭된 보호자 상세 정보 조회 (ID 기반)
            const guardianIds = matchedResults.map(
                (m: { target_guardian_id: string }) => m.target_guardian_id
            );

            const { data: fullProfiles, error: fetchError } = await supabase
                .from("guardians")
                .select(`
                    *,
                    users ( trust_score, trust_level ),
                    dogs ( * )
                `)
                .in("id", guardianIds);

            if (fetchError) throw fetchError;

            // 3. 데이터 병합 및 RPC 순서 강제 복원 (Locked Decisions 3.3)
            const profiles = guardianIds.map((id: string) => {
                const profile = fullProfiles?.find((p) => p.id === id);
                const matchInfo = matchedResults.find(
                    (m: { target_guardian_id: string }) => m.target_guardian_id === id
                );

                if (!profile) return null;

                return {
                    ...profile,
                    distance_meters: matchInfo?.distance_meters,
                    compatibility_score: matchInfo?.compatibility_score,
                    time_overlap_score: matchInfo?.time_overlap_score,
                } as MatchGuardianProfile;
            }).filter(Boolean) as MatchGuardianProfile[];

            return profiles;
        },
        enabled: enabled && !!guardianId,
    });
}

// 스와이프 액션 (Like / Pass) Mutation 훅 + 상호 매칭 감지
export function useCreateMatchAction() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            from_guardian_id,
            to_guardian_id,
            action_type,
            liked_section,
            comment,
        }: {
            from_guardian_id: string;
            to_guardian_id: string;
            action_type: "like" | "pass";
            liked_section?: string;
            comment?: string;
        }): Promise<{ isMutual: boolean }> => {
            if (action_type === "pass") {
                const { error } = await supabase.from("matches").insert({
                    from_guardian_id,
                    to_guardian_id,
                    status: "rejected",
                });
                if (error) throw error;
                return { isMutual: false };
            }

            // Like 처리
            const { error } = await supabase.from("matches").insert({
                from_guardian_id,
                to_guardian_id,
                status: "pending",
                liked_section,
                comment,
            });
            if (error) throw error;

            // 상호 매칭 감지: 상대방 → 나 방향의 pending/accepted 매치 확인
            const { data: reverseMatch } = await supabase
                .from("matches")
                .select("id, status")
                .eq("from_guardian_id", to_guardian_id)
                .eq("to_guardian_id", from_guardian_id)
                .in("status", ["pending", "accepted"])
                .single();

            if (reverseMatch) {
                // 양방향 존재 → 두 매치 모두 accepted로 업데이트
                await supabase
                    .from("matches")
                    .update({ status: "accepted" })
                    .eq("from_guardian_id", from_guardian_id)
                    .eq("to_guardian_id", to_guardian_id)
                    .eq("status", "pending");

                await supabase
                    .from("matches")
                    .update({ status: "accepted" })
                    .eq("id", reverseMatch.id);

                return { isMutual: true };
            }

            return { isMutual: false };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["matching-guardians"],
            });
        },
    });
}
