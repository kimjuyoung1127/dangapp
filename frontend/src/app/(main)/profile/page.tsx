// File: Profile page reframed as a family trust dashboard.
"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import { FamilyPageIntro, FamilySectionTitle, FamilySurface } from "@/components/shared/FamilyUi";
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
                <div className="space-y-5 px-4 py-6">
                    <ProfileSkeleton />
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="space-y-5 px-4 py-6">
                <FamilyPageIntro
                    eyebrow="family trust dashboard"
                    title="프로필"
                    description="신뢰도, 후기, 반려 정보와 알림 설정을 한 곳에서 관리합니다."
                    action={
                        <Button variant="ghost" size="icon" className="bg-white text-sky-700 hover:bg-sky-50" onClick={() => setIsEditOpen(true)}>
                            <Settings className="h-5 w-5" />
                        </Button>
                    }
                />

                <ProfileHeader nickname={guardian.nickname} dogName={dog?.name} trustLevel={trustLevel} />
                <TrustScoreDisplay score={trustScore} level={trustLevel} />

                <FamilySurface>
                    <FamilySectionTitle title="신뢰 배지" meta="가족처럼 안심하고 연결될 수 있는 근거를 정리합니다." />
                    <div className="mt-4">
                        <TrustBadgeList earnedBadges={badges ?? []} />
                    </div>
                </FamilySurface>

                <FamilySurface>
                    <FamilySectionTitle title="활동 요약" meta="후기, 평점, 완료된 일정 현황입니다." />
                    <div className="mt-4">
                        <ProfileStats
                            reviewCount={stats?.reviewCount ?? 0}
                            avgRating={stats?.avgRating ?? 0}
                            completedSchedules={stats?.completedSchedules ?? 0}
                        />
                    </div>
                </FamilySurface>

                {userId ? (
                    <FamilySurface tone="soft">
                        <FamilySectionTitle title="알림 설정" meta="대화, 일정, 협업 관련 알림을 조정합니다." />
                        <div className="mt-4">
                            <NotificationSettings userId={userId} />
                        </div>
                    </FamilySurface>
                ) : null}

                <FamilySurface>
                    <FamilySectionTitle title="받은 후기" meta="최근 연결에서 쌓인 신뢰를 확인하세요." />
                    <div className="mt-4">
                        <ReviewList targetId={guardianId ?? ""} />
                    </div>
                </FamilySurface>
            </div>

            {guardian ? (
                <EditProfileSheet
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    guardian={guardian}
                    dog={dog}
                />
            ) : null}
        </AppShell>
    );
}

function ProfileSkeleton() {
    return (
        <div className="space-y-5">
            <FamilySurface tone="soft" className="space-y-3">
                <Skeleton className="h-3 w-32 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
            </FamilySurface>
            <Skeleton className="h-56 w-full rounded-[1.75rem]" />
            <Skeleton className="h-56 w-full rounded-[1.75rem]" />
            <Skeleton className="h-48 w-full rounded-[1.75rem]" />
        </div>
    );
}
