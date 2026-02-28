// profile/page.tsx — 내 프로필 페이지 (신뢰 점수 + 뱃지 + 받은 후기)

"use client";

import { AppShell } from "@/components/shared/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import ProfileHeader from "@/components/features/profile/ProfileHeader";
import TrustScoreDisplay from "@/components/features/profile/TrustScoreDisplay";
import TrustBadgeList from "@/components/features/profile/TrustBadgeList";
import ProfileStats from "@/components/features/profile/ProfileStats";
import ReviewList from "@/components/features/review/ReviewList";
import type { Database } from "@/types/database.types";

type TrustBadge = Database["public"]["Tables"]["trust_badges"]["Row"];

// 더미 데이터 (Supabase 연동 전 시각적 확인용)
const MOCK_GUARDIAN_ID = "mock-guardian-001";

const MOCK_PROFILE = {
    nickname: "초코언니",
    dogName: "초코",
    trustScore: 72,
    trustLevel: 3,
};

const MOCK_BADGES: TrustBadge[] = [
    {
        id: "b1",
        guardian_id: MOCK_GUARDIAN_ID,
        badge_type: "verified" as const,
        earned_at: "2026-01-15T00:00:00Z",
    },
    {
        id: "b2",
        guardian_id: MOCK_GUARDIAN_ID,
        badge_type: "active_walker" as const,
        earned_at: "2026-02-10T00:00:00Z",
    },
];

const MOCK_STATS = {
    reviewCount: 12,
    avgRating: 4.2,
    completedSchedules: 15,
};

export default function ProfilePage() {
    // TODO: 실제 인증된 사용자 ID로 교체
    // const { data: profile, isLoading } = useGuardianProfile(userId);
    // const { data: badges } = useTrustBadges(userId);
    const isLoading = false;

    if (isLoading) {
        return (
            <AppShell>
                <div className="px-4 py-6 space-y-6">
                    <ProfileSkeleton />
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="px-4 py-6 space-y-6">
                {/* 페이지 타이틀 */}
                <h1 className="text-2xl font-display font-bold text-foreground">
                    내 프로필
                </h1>

                {/* 프로필 헤더 */}
                <ProfileHeader
                    nickname={MOCK_PROFILE.nickname}
                    dogName={MOCK_PROFILE.dogName}
                    trustLevel={MOCK_PROFILE.trustLevel}
                />

                {/* 신뢰 점수 게이지 */}
                <TrustScoreDisplay
                    score={MOCK_PROFILE.trustScore}
                    level={MOCK_PROFILE.trustLevel}
                />

                {/* 뱃지 */}
                <TrustBadgeList earnedBadges={MOCK_BADGES} />

                {/* 통계 */}
                <ProfileStats
                    reviewCount={MOCK_STATS.reviewCount}
                    avgRating={MOCK_STATS.avgRating}
                    completedSchedules={MOCK_STATS.completedSchedules}
                />

                {/* 받은 후기 */}
                <div>
                    <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                        받은 후기
                    </h2>
                    <ReviewList targetId={MOCK_GUARDIAN_ID} />
                </div>
            </div>
        </AppShell>
    );
}

function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            {/* 타이틀 */}
            <Skeleton className="h-8 w-28 rounded-xl" />

            {/* 프로필 헤더 */}
            <div className="bg-card rounded-3xl border border-border p-6 flex flex-col items-center gap-3">
                <Skeleton className="w-20 h-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-xl" />
                <Skeleton className="h-4 w-32 rounded-xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            {/* 신뢰 점수 */}
            <div className="bg-card rounded-3xl border border-border p-6">
                <Skeleton className="h-4 w-16 rounded-xl mb-4" />
                <div className="flex items-center gap-6">
                    <Skeleton className="w-28 h-28 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-20 rounded-xl" />
                        <Skeleton className="h-4 w-28 rounded-xl" />
                    </div>
                </div>
            </div>

            {/* 뱃지 */}
            <div className="bg-card rounded-3xl border border-border p-5">
                <Skeleton className="h-4 w-12 rounded-xl mb-4" />
                <div className="flex gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="w-[72px] h-24 rounded-xl" />
                    ))}
                </div>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-card rounded-3xl border border-border p-4 flex flex-col items-center gap-1"
                    >
                        <Skeleton className="h-8 w-10 rounded-xl" />
                        <Skeleton className="h-3 w-8 rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    );
}
