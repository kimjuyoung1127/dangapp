// profile/page.tsx — 내 프로필 페이지 (실데이터 바인딩, DANG-PRF-001)

"use client";

import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useGuardianProfile, useTrustBadges, useProfileStats } from "@/lib/hooks/useProfile";
import ProfileHeader from "@/components/features/profile/ProfileHeader";
import TrustScoreDisplay from "@/components/features/profile/TrustScoreDisplay";
import TrustBadgeList from "@/components/features/profile/TrustBadgeList";
import ProfileStats from "@/components/features/profile/ProfileStats";
import ReviewList from "@/components/features/review/ReviewList";
import EditProfileSheet from "@/components/features/profile/EditProfileSheet";
import NotificationSettings from "@/components/features/profile/NotificationSettings";
import { Settings } from "lucide-react";

export default function ProfilePage() {
    const [isEditOpen, setIsEditOpen] = useState(false);

    const { data: guardian, isLoading: guardianLoading } = useCurrentGuardian();
    const guardianId = guardian?.id;
    const userId = guardian?.user_id;
    const dog = guardian?.dogs?.[0] ?? null;

    const { data: profile } = useGuardianProfile(userId ?? "");
    const { data: badges } = useTrustBadges(guardianId ?? "");
    const { data: stats } = useProfileStats(guardianId ?? "");

    const trustScore = profile?.user?.trust_score ?? 0;
    const trustLevel = profile?.user?.trust_level ?? 1;

    const isLoading = guardianLoading || !guardian;

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
                {/* 페이지 타이틀 + 편집 버튼 */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-display font-bold text-foreground">
                        내 프로필
                    </h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditOpen(true)}
                    >
                        <Settings className="w-5 h-5 text-foreground-muted" />
                    </Button>
                </div>

                {/* 프로필 헤더 */}
                <ProfileHeader
                    nickname={guardian.nickname}
                    dogName={dog?.name}
                    trustLevel={trustLevel}
                />

                {/* 신뢰 점수 게이지 */}
                <TrustScoreDisplay
                    score={trustScore}
                    level={trustLevel}
                />

                {/* 뱃지 */}
                <TrustBadgeList earnedBadges={badges ?? []} />

                {/* 통계 */}
                <ProfileStats
                    reviewCount={stats?.reviewCount ?? 0}
                    avgRating={stats?.avgRating ?? 0}
                    completedSchedules={stats?.completedSchedules ?? 0}
                />

                {/* 알림 설정 */}
                {userId && <NotificationSettings userId={userId} />}

                {/* 받은 후기 */}
                <div>
                    <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                        받은 후기
                    </h2>
                    <ReviewList targetId={guardianId ?? ""} />
                </div>
            </div>

            {/* 프로필 편집 BottomSheet */}
            {guardian && (
                <EditProfileSheet
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    guardian={guardian}
                    dog={dog}
                />
            )}
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
