// useProfile.ts — 프로필 + 뱃지 + 신뢰 점수 훅

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];
type Guardian = Database["public"]["Tables"]["guardians"]["Row"];
type TrustBadge = Database["public"]["Tables"]["trust_badges"]["Row"];

export interface GuardianProfile {
    user: User;
    guardian: Guardian | null;
}

/** 보호자 프로필 (users + guardians) */
export function useGuardianProfile(guardianId: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["guardian-profile", guardianId],
        queryFn: async () => {
            const { data: user, error: userError } = await supabase
                .from("users")
                .select("*")
                .eq("id", guardianId)
                .single();

            if (userError) throw userError;

            const { data: guardian } = await supabase
                .from("guardians")
                .select("*")
                .eq("user_id", guardianId)
                .maybeSingle();

            return { user, guardian } as GuardianProfile;
        },
        enabled: !!guardianId,
    });
}

/** 뱃지 목록 */
export function useTrustBadges(guardianId: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["trust-badges", guardianId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("trust_badges")
                .select("*")
                .eq("guardian_id", guardianId)
                .order("earned_at", { ascending: true });

            if (error) throw error;
            return (data || []) as TrustBadge[];
        },
        enabled: !!guardianId,
    });
}

/** 신뢰 점수/레벨 업데이트 mutation */
export function useUpdateTrustScore() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            trustScore,
            trustLevel,
        }: {
            userId: string;
            trustScore: number;
            trustLevel: number;
        }) => {
            const { error } = await supabase
                .from("users")
                .update({
                    trust_score: trustScore,
                    trust_level: trustLevel,
                })
                .eq("id", userId);

            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["guardian-profile", variables.userId],
            });
        },
    });
}
