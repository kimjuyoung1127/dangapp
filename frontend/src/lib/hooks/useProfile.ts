// useProfile.ts — 프로필 + 뱃지 + 신뢰 점수 + 편집 + 알림 + 통계 훅 (DANG-PRF-001)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];
type Guardian = Database["public"]["Tables"]["guardians"]["Row"];
type GuardianUpdate = Database["public"]["Tables"]["guardians"]["Update"];
type DogUpdate = Database["public"]["Tables"]["dogs"]["Update"];
type TrustBadge = Database["public"]["Tables"]["trust_badges"]["Row"];
type NotificationSettings = Database["public"]["Tables"]["notification_settings"]["Row"];

export interface GuardianProfile {
    user: User;
    guardian: Guardian | null;
}

// ─── 기존 훅 ─────────────────────────────

/** 보호자 프로필 (users + guardians) */
export function useGuardianProfile(userId: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["guardian-profile", userId],
        queryFn: async () => {
            const { data: user, error: userError } = await supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .single();

            if (userError) throw userError;

            const { data: guardian } = await supabase
                .from("guardians")
                .select("*")
                .eq("user_id", userId)
                .maybeSingle();

            return { user, guardian } as GuardianProfile;
        },
        enabled: !!userId,
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

// ─── 프로필 편집 훅 (DANG-PRF-001) ─────────────────────────────

/** 보호자 정보 업데이트 mutation */
export function useUpdateGuardian() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            guardianId,
            data,
        }: {
            guardianId: string;
            data: GuardianUpdate;
        }) => {
            const { error } = await supabase
                .from("guardians")
                .update(data)
                .eq("id", guardianId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["guardian-profile"] });
            queryClient.invalidateQueries({ queryKey: ["current-guardian"] });
        },
    });
}

/** 반려견 정보 업데이트 mutation */
export function useUpdateDog() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            dogId,
            data,
        }: {
            dogId: string;
            data: DogUpdate;
        }) => {
            const { error } = await supabase
                .from("dogs")
                .update(data)
                .eq("id", dogId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["current-guardian"] });
        },
    });
}

// ─── 알림 설정 훅 ─────────────────────────────

/** 알림 설정 조회 */
export function useNotificationSettings(userId: string | undefined) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["notification-settings", userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("notification_settings")
                .select("*")
                .eq("user_id", userId!)
                .maybeSingle();

            if (error) throw error;

            // 레코드 없으면 기본값 반환
            if (!data) {
                return {
                    user_id: userId!,
                    marketing_opt_in: false,
                    chat_opt_in: true,
                    schedule_opt_in: true,
                    danglog_opt_in: true,
                    push_opt_in: true,
                    updated_at: new Date().toISOString(),
                } as NotificationSettings;
            }

            return data as NotificationSettings;
        },
        enabled: !!userId,
    });
}

/** 알림 설정 업데이트 (UPSERT) */
export function useUpdateNotificationSettings() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            settings,
        }: {
            userId: string;
            settings: Partial<Omit<NotificationSettings, "user_id" | "updated_at">>;
        }) => {
            const { error } = await supabase
                .from("notification_settings")
                .upsert({
                    user_id: userId,
                    ...settings,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["notification-settings", variables.userId],
            });
        },
    });
}

// ─── 프로필 통계 훅 ─────────────────────────────

export interface ProfileStatsData {
    reviewCount: number;
    avgRating: number;
    completedSchedules: number;
}

/** 프로필 통계 집계 */
export function useProfileStats(guardianId: string | undefined) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["profile-stats", guardianId],
        queryFn: async () => {
            // 받은 후기 수 + 평균 점수
            const { data: reviews, error: rErr } = await supabase
                .from("reviews")
                .select("rating")
                .eq("target_id", guardianId!);

            if (rErr) throw rErr;

            const reviewCount = reviews?.length ?? 0;
            const avgRating = reviewCount > 0
                ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
                : 0;

            // 완료 약속 수 (organizer)
            const { count: orgCount } = await supabase
                .from("schedules")
                .select("*", { count: "exact", head: true })
                .eq("organizer_id", guardianId!)
                .eq("status", "completed");

            // 완료 약속 수 (participant)
            const { count: partCount } = await supabase
                .from("schedules")
                .select("*", { count: "exact", head: true })
                .contains("participant_ids", [guardianId!])
                .eq("status", "completed");

            const completedSchedules = (orgCount ?? 0) + (partCount ?? 0);

            return {
                reviewCount,
                avgRating: Math.round(avgRating * 10) / 10,
                completedSchedules,
            } as ProfileStatsData;
        },
        enabled: !!guardianId,
    });
}
