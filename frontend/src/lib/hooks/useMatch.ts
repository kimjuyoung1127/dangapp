// useMatch.ts — 매칭 추천 + Like/Pass 액션 훅 (DANG-MAT-001)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { MatchGuardianProfile } from "@/components/features/match/types";

interface UseMatchingGuardiansOptions {
    guardianId: string;
    mode?: "basic" | "care" | "family";
    enabled?: boolean;
}

const MODE_TO_PURPOSE: Record<string, string> = {
    basic: "friend",
    care: "care",
    family: "family",
};

export function useMatchingGuardians({
    guardianId,
    mode,
    enabled = true,
}: UseMatchingGuardiansOptions) {
    const supabase = createClient();

    return useQuery<MatchGuardianProfile[]>({
        queryKey: ["matching-guardians", guardianId, mode],
        queryFn: async () => {
            // 1. RPC 호출: 추천 보호자 리스트 (30명)
            const { data: matchedIds, error: rpcError } = await supabase.rpc(
                "match_guardians",
                {
                    p_guardian_id: guardianId,
                    p_limit: 30,
                    p_offset: 0,
                }
            );

            if (rpcError) throw rpcError;
            if (!matchedIds || matchedIds.length === 0) return [];

            // 2. 매칭된 보호자 상세 정보 (guardians + users + dogs)
            const guardianIds = matchedIds.map(
                (m: { guardian_id: string }) => m.guardian_id
            );

            const { data: fullProfiles, error: fetchError } = await supabase
                .from("guardians")
                .select(
                    `
                    *,
                    users ( trust_score, trust_level ),
                    dogs ( * )
                `
                )
                .in("id", guardianIds);

            if (fetchError) throw fetchError;

            // 3. RPC 거리/호환성 점수 병합
            let profiles = (fullProfiles ?? []).map((profile) => {
                const matchInfo = matchedIds.find(
                    (m: {
                        guardian_id: string;
                        distance_meters: number;
                        compatibility_score: number;
                    }) => m.guardian_id === profile.id
                );
                return {
                    ...profile,
                    distance_meters: matchInfo?.distance_meters,
                    compatibility_score: matchInfo?.compatibility_score,
                } as MatchGuardianProfile;
            });

            // 4. 모드 필터 (클라이언트 사이드 usage_purpose 필터)
            if (mode && mode !== "basic") {
                const purposeKey = MODE_TO_PURPOSE[mode];
                profiles = profiles.filter(
                    (p) =>
                        p.usage_purpose && p.usage_purpose.includes(purposeKey as "friend" | "care" | "family")
                );
            }

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
