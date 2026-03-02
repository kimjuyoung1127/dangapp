// page.tsx — /home 매칭 추천 페이지 (DANG-MAT-001)
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { TapScale } from "@/components/ui/MotionWrappers";
import MatchCard from "@/components/features/match/MatchCard";
import MatchEmptyState from "@/components/features/match/MatchEmptyState";
import IncompleteProfileBanner from "@/components/features/match/IncompleteProfileBanner";
import MutualMatchModal from "@/components/features/match/MutualMatchModal";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useMatchingGuardians, useCreateMatchAction } from "@/lib/hooks/useMatch";
import { useGetOrCreateChatRoom } from "@/lib/hooks/useChat";
import { useModeStore } from "@/stores/useModeStore";
import { Layers } from "lucide-react";

const MODE_LABELS: Record<string, string> = {
    basic: "추천 친구",
    care: "돌봄 도우미",
    family: "가족 찾기",
};

export default function HomePage() {
    const router = useRouter();
    const { activeMode } = useModeStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mutualMatch, setMutualMatch] = useState<{
        partnerName: string;
        dogName: string;
        chatId: string;
    } | null>(null);

    // 1. 현재 guardian 로드
    const { data: guardian, isLoading: guardianLoading } = useCurrentGuardian();
    const guardianId = guardian?.id ?? "";

    // 2. 매칭 추천 로드
    const {
        data: profiles = [],
        isLoading: profilesLoading,
    } = useMatchingGuardians({
        guardianId,
        mode: activeMode,
        enabled: !!guardianId,
    });

    // 3. Like/Pass 뮤테이션 + 채팅방 생성
    const matchAction = useCreateMatchAction();
    const getOrCreateRoom = useGetOrCreateChatRoom();

    const isLoading = guardianLoading || (!!guardianId && profilesLoading);
    const currentProfile = profiles[currentIndex];
    const hasProfiles = profiles.length > 0 && currentIndex < profiles.length;

    const advanceCard = useCallback(() => {
        setCurrentIndex((prev) => prev + 1);
    }, []);

    const handleLike = useCallback(
        (section: string) => {
            if (!currentProfile || !guardianId) return;

            matchAction.mutate(
                {
                    from_guardian_id: guardianId,
                    to_guardian_id: currentProfile.id,
                    action_type: "like",
                    liked_section: section,
                },
                {
                    onSuccess: (result) => {
                        if (result.isMutual) {
                            const dog = currentProfile.dogs[0];
                            setMutualMatch({
                                partnerName: currentProfile.nickname,
                                dogName: dog?.name ?? "강아지",
                                chatId: currentProfile.id,
                            });
                        } else {
                            advanceCard();
                        }
                    },
                }
            );
        },
        [currentProfile, guardianId, matchAction, advanceCard]
    );

    const handlePass = useCallback(() => {
        if (!currentProfile || !guardianId) return;

        matchAction.mutate(
            {
                from_guardian_id: guardianId,
                to_guardian_id: currentProfile.id,
                action_type: "pass",
            },
            {
                onSuccess: () => advanceCard(),
            }
        );
    }, [currentProfile, guardianId, matchAction, advanceCard]);

    const handleChat = useCallback(() => {
        if (!mutualMatch || !guardianId) return;

        getOrCreateRoom.mutate(
            {
                myGuardianId: guardianId,
                partnerGuardianId: mutualMatch.chatId,
            },
            {
                onSuccess: (roomId) => {
                    setMutualMatch(null);
                    router.push(`/chat/${roomId}`);
                },
            }
        );
    }, [mutualMatch, guardianId, getOrCreateRoom, router]);

    const handleCloseModal = useCallback(() => {
        setMutualMatch(null);
        advanceCard();
    }, [advanceCard]);

    return (
        <AppShell>
            <div className="w-full max-w-md mx-auto px-4">
                {/* 모드 선택 헤더 */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-display font-semibold">
                        {MODE_LABELS[activeMode] ?? "추천 친구"}
                    </h2>
                    <TapScale>
                        <Link
                            href="/modes"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-light/20 text-primary text-sm font-medium"
                        >
                            <Layers className="w-4 h-4" />
                            모드
                        </Link>
                    </TapScale>
                </div>

                {/* 프로필 완성 유도 배너 */}
                {guardian && (
                    <IncompleteProfileBanner
                        progress={guardian.onboarding_progress ?? 0}
                    />
                )}

                {/* 메인 컨텐츠 */}
                {isLoading ? (
                    <div className="space-y-6">
                        <MatchCardSkeleton />
                    </div>
                ) : !hasProfiles ? (
                    <MatchEmptyState />
                ) : (
                    <div className="space-y-6">
                        <MatchCard
                            key={currentProfile.id}
                            profile={currentProfile}
                            onLike={handleLike}
                            onPass={handlePass}
                        />
                    </div>
                )}
            </div>

            {/* 상호 매칭 모달 */}
            <MutualMatchModal
                isOpen={!!mutualMatch}
                partnerName={mutualMatch?.partnerName ?? ""}
                dogName={mutualMatch?.dogName ?? ""}
                onChat={handleChat}
                onClose={handleCloseModal}
            />
        </AppShell>
    );
}

// 스켈레톤 팩토리 패턴 (SKILL-06 적용)
function MatchCardSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-4 border border-border rounded-3xl bg-card">
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="w-24 h-5 rounded-xl" />
            </div>
            <Skeleton className="w-full aspect-[4/5] rounded-3xl" />
            <div className="space-y-2">
                <Skeleton className="w-3/4 h-4 rounded-xl" />
                <Skeleton className="w-1/2 h-4 rounded-xl" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="w-16 h-8 rounded-full" />
                <Skeleton className="w-20 h-8 rounded-full" />
                <Skeleton className="w-14 h-8 rounded-full" />
            </div>
        </div>
    );
}
