// File: Home route with family-oriented live matching UI.
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Layers } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import MatchCard from "@/components/features/match/MatchCard";
import MatchEmptyState from "@/components/features/match/MatchEmptyState";
import IncompleteProfileBanner from "@/components/features/match/IncompleteProfileBanner";
import MutualMatchModal from "@/components/features/match/MutualMatchModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { TapScale } from "@/components/ui/MotionWrappers";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useMatchingGuardians, useCreateMatchAction } from "@/lib/hooks/useMatch";
import { useGetOrCreateChatRoom } from "@/lib/hooks/useChat";
import { useModeStore } from "@/stores/useModeStore";

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

    const { data: guardian, isLoading: guardianLoading } = useCurrentGuardian();
    const guardianId = guardian?.id ?? "";

    const {
        data: profiles = [],
        isLoading: profilesLoading,
    } = useMatchingGuardians({
        guardianId,
        mode: activeMode,
        enabled: !!guardianId,
    });

    const modeLabel = MODE_LABELS[activeMode] ?? MODE_LABELS.basic;
    const hasLocation = useMemo(() => !!guardian?.location, [guardian?.location]);

    useEffect(() => {
        setCurrentIndex(0);
    }, [profiles, activeMode]);

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
                            return;
                        }

                        advanceCard();
                    },
                }
            );
        },
        [advanceCard, currentProfile, guardianId, matchAction]
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
    }, [advanceCard, currentProfile, guardianId, matchAction]);

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
    }, [getOrCreateRoom, guardianId, mutualMatch, router]);

    const handleCloseModal = useCallback(() => {
        setMutualMatch(null);
        advanceCard();
    }, [advanceCard]);

    return (
        <AppShell>
            <div className="mx-auto w-full max-w-md px-4 pb-10">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                            family organizer pick
                        </p>
                        <h2 className="mt-1 text-2xl font-display font-semibold text-foreground">
                            {modeLabel}
                        </h2>
                    </div>
                    <TapScale>
                        <Link
                            href="/modes"
                            className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-700"
                        >
                            <Layers className="h-4 w-4" />
                            모드
                        </Link>
                    </TapScale>
                </div>

                <HomeFamilyIntroCard modeLabel={modeLabel} />

                {guardian ? (
                    <IncompleteProfileBanner progress={guardian.onboarding_progress ?? 0} />
                ) : null}

                {isLoading ? (
                    <div className="space-y-5">
                        <MatchCardSkeleton />
                    </div>
                ) : !hasProfiles ? (
                    <MatchEmptyState reason={!hasLocation ? "no-location" : "no-results"} />
                ) : (
                    <MatchCard
                        key={currentProfile.id}
                        profile={currentProfile}
                        onLike={handleLike}
                        onPass={handlePass}
                    />
                )}
            </div>

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

function HomeFamilyIntroCard({ modeLabel }: { modeLabel: string }) {
    return (
        <div className="mb-4 rounded-[1.75rem] border border-sky-100 bg-sky-50/80 p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-2xl bg-white p-2 text-sky-700 shadow-sm">
                    <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-foreground">
                        가족처럼 믿고 연결되는 {modeLabel}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-foreground-muted">
                        거리, 신뢰 정보, 일정 힌트를 함께 보여드려서 더 안심하고 관심을 보낼 수 있게 구성했어요.
                    </p>
                </div>
            </div>
        </div>
    );
}

function MatchCardSkeleton() {
    return (
        <div className="space-y-4 rounded-[2rem] border border-sky-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-28 rounded-full" />
                    <Skeleton className="h-8 w-40 rounded-2xl" />
                    <Skeleton className="h-4 w-48 rounded-xl" />
                </div>
                <Skeleton className="h-16 w-20 rounded-3xl" />
            </div>
            <Skeleton className="aspect-[4/5] w-full rounded-[1.75rem]" />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
            </div>
            <Skeleton className="h-32 w-full rounded-[1.5rem]" />
            <Skeleton className="h-40 w-full rounded-[1.5rem]" />
            <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-12 w-full rounded-full" />
                <Skeleton className="h-12 w-full rounded-full" />
            </div>
        </div>
    );
}
