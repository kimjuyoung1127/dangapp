"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ModeCard from "@/components/features/modes/ModeCard";
import ModeUnlockDialog from "@/components/features/modes/ModeUnlockDialog";
import { AppShell } from "@/components/shared/AppShell";
import {
    FamilyDebugBadge,
    FamilyPageIntro,
    FamilySectionTitle,
    FamilyStatusChip,
    FamilySurface,
} from "@/components/shared/FamilyUi";
import { Skeleton } from "@/components/ui/Skeleton";
import { hasDebugDemoData, isDebugDemoFallbackEnabled } from "@/lib/debugDemoFallback";
import { MODE_CONFIG, type ModeConfig } from "@/lib/constants/modes";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useModesDebugDemo } from "@/lib/hooks/useDebugDemoFallback";
import { useDogOwnerships, useMyScheduleParticipants } from "@/lib/hooks/useFamily";
import { useMyReservations, usePartnerPlaces } from "@/lib/hooks/useCare";
import { useModeUnlocks } from "@/lib/hooks/useMode";
import {
    summarizeCareProgress,
    summarizeFamilyProgress,
    type ModeProgressSummary,
} from "@/lib/modesProgress";

export default function ModesPage() {
    const router = useRouter();
    const [activeMode, setActiveMode] = useState<string>("basic");
    const [lockedMode, setLockedMode] = useState<ModeConfig | null>(null);

    const { data: guardian } = useCurrentGuardian();
    const guardianId = guardian?.id ?? "";
    const trustLevel = guardian?.trust_level ?? 0;
    const trustScore = guardian?.trust_score ?? 0;

    const { data: unlocks = [] } = useModeUnlocks(guardianId);
    const {
        data: partnerPlaces = [],
        isLoading: isPartnerPlacesLoading,
        isError: isPartnerPlacesError,
        refetch: refetchPartnerPlaces,
    } = usePartnerPlaces();
    const {
        data: myReservations = [],
        isLoading: isReservationsLoading,
        isError: isReservationsError,
        refetch: refetchReservations,
    } = useMyReservations(guardianId);
    const {
        data: dogOwnerships = [],
        isLoading: isOwnershipsLoading,
        isError: isOwnershipsError,
        refetch: refetchOwnerships,
    } = useDogOwnerships(guardianId);
    const {
        data: scheduleParticipants = [],
        isLoading: isParticipantsLoading,
        isError: isParticipantsError,
        refetch: refetchParticipants,
    } = useMyScheduleParticipants(guardianId);
    const { data: demoPayload } = useModesDebugDemo();

    const unlockedModes = useMemo(() => {
        const set = new Set(unlocks.map((unlock) => unlock.mode));
        set.add("basic");
        return set;
    }, [unlocks]);

    const careFallbackActive =
        isDebugDemoFallbackEnabled() &&
        !isPartnerPlacesLoading &&
        !isReservationsLoading &&
        hasDebugDemoData(demoPayload?.partnerPlaces) &&
        (isPartnerPlacesError || isReservationsError || (partnerPlaces.length === 0 && myReservations.length === 0));

    const familyFallbackActive =
        isDebugDemoFallbackEnabled() &&
        !isOwnershipsLoading &&
        !isParticipantsLoading &&
        hasDebugDemoData(demoPayload?.ownerships) &&
        (isOwnershipsError || isParticipantsError || (dogOwnerships.length === 0 && scheduleParticipants.length === 0));

    const resolvedPartnerPlaces = useMemo(
        () => (careFallbackActive ? demoPayload?.partnerPlaces ?? [] : partnerPlaces),
        [careFallbackActive, demoPayload?.partnerPlaces, partnerPlaces]
    );
    const resolvedReservations = useMemo(
        () => (careFallbackActive ? demoPayload?.reservations ?? [] : myReservations),
        [careFallbackActive, demoPayload?.reservations, myReservations]
    );
    const resolvedOwnerships = useMemo(
        () => (familyFallbackActive ? demoPayload?.ownerships ?? [] : dogOwnerships),
        [demoPayload?.ownerships, dogOwnerships, familyFallbackActive]
    );
    const resolvedParticipants = useMemo(
        () => (familyFallbackActive ? demoPayload?.participants ?? [] : scheduleParticipants),
        [demoPayload?.participants, familyFallbackActive, scheduleParticipants]
    );

    const pendingReservationCount = useMemo(
        () => resolvedReservations.filter((reservation) => reservation.status === "pending").length,
        [resolvedReservations]
    );
    const acceptedParticipantCount = useMemo(
        () => resolvedParticipants.filter((participant) => participant.status === "accepted").length,
        [resolvedParticipants]
    );

    const careSummary = useMemo(
        () =>
            summarizeCareProgress({
                hasError: !careFallbackActive && (isPartnerPlacesError || isReservationsError),
                placesCount: resolvedPartnerPlaces.length,
                reservationsCount: resolvedReservations.length,
                pendingReservationsCount: pendingReservationCount,
            }),
        [
            careFallbackActive,
            isPartnerPlacesError,
            isReservationsError,
            pendingReservationCount,
            resolvedPartnerPlaces.length,
            resolvedReservations.length,
        ]
    );
    const familySummary = useMemo(
        () =>
            summarizeFamilyProgress({
                hasError: !familyFallbackActive && (isOwnershipsError || isParticipantsError),
                ownershipCount: resolvedOwnerships.length,
                participantsCount: resolvedParticipants.length,
                acceptedParticipantsCount: acceptedParticipantCount,
            }),
        [
            acceptedParticipantCount,
            familyFallbackActive,
            isOwnershipsError,
            isParticipantsError,
            resolvedOwnerships.length,
            resolvedParticipants.length,
        ]
    );

    const isB2BSummaryLoading =
        isPartnerPlacesLoading || isReservationsLoading || isOwnershipsLoading || isParticipantsLoading;
    const hasB2BSummaryError =
        (isPartnerPlacesError || isReservationsError || isOwnershipsError || isParticipantsError) &&
        !careFallbackActive &&
        !familyFallbackActive;

    const isModeUnlocked = (config: ModeConfig) => {
        if (config.mode === "basic") return true;
        return unlockedModes.has(config.mode) || trustLevel >= config.requiredLevel;
    };

    const handleSelect = (config: ModeConfig) => {
        if (!isModeUnlocked(config)) {
            setLockedMode(config);
            return;
        }

        setActiveMode(config.mode);

        if (config.mode === "care") {
            void router.push("/care");
            return;
        }

        if (config.mode === "family") {
            void router.push("/family");
        }
    };

    return (
        <AppShell>
            <div className="space-y-5 px-4 py-6">
                <FamilyPageIntro
                    eyebrow="이용 모드"
                    title="모드 관리"
                    description="신뢰 레벨과 준비 상태를 확인하고 필요한 모드로 이동해 보세요."
                />

                <FamilySurface tone="soft" className="space-y-4">
                    <FamilySectionTitle
                        title="모드 준비 상태"
                        meta="돌봄과 함께 돌봄 기능을 바로 사용할 수 있는지 한눈에 확인해 보세요."
                        action={
                            hasB2BSummaryError ? (
                                <button
                                    type="button"
                                    className="text-sm font-semibold text-sky-700"
                                    onClick={() => {
                                        void refetchPartnerPlaces();
                                        void refetchReservations();
                                        void refetchOwnerships();
                                        void refetchParticipants();
                                    }}
                                >
                                    다시 불러오기
                                </button>
                            ) : null
                        }
                    />

                    {isB2BSummaryLoading ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <StatusCardSkeleton />
                            <StatusCardSkeleton />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <ModeStatusCard
                                title="돌봄"
                                summary={careSummary}
                                route="/care"
                                metrics={[
                                    `이용 가능한 장소 ${resolvedPartnerPlaces.length}곳`,
                                    `예약 내역 ${resolvedReservations.length}건`,
                                ]}
                                showDebugBadge={careFallbackActive}
                            />
                            <ModeStatusCard
                                title="함께 돌봄"
                                summary={familySummary}
                                route="/family"
                                metrics={[
                                    `공동 돌봄 연결 ${resolvedOwnerships.length}건`,
                                    `공유 일정 참여 ${resolvedParticipants.length}건`,
                                ]}
                                showDebugBadge={familyFallbackActive}
                            />
                        </div>
                    )}
                </FamilySurface>

                <div className="space-y-4">
                    {MODE_CONFIG.map((config) => (
                        <ModeCard
                            key={config.mode}
                            config={config}
                            isUnlocked={isModeUnlocked(config)}
                            isActive={activeMode === config.mode}
                            currentLevel={trustLevel}
                            onSelect={() => handleSelect(config)}
                        />
                    ))}
                </div>
            </div>

            {lockedMode ? (
                <ModeUnlockDialog
                    isOpen={!!lockedMode}
                    onClose={() => setLockedMode(null)}
                    config={lockedMode}
                    currentLevel={trustLevel}
                    currentScore={trustScore}
                />
            ) : null}
        </AppShell>
    );
}

function ModeStatusCard({
    title,
    summary,
    route,
    metrics,
    showDebugBadge,
}: {
    title: string;
    summary: ModeProgressSummary;
    route: string;
    metrics: string[];
    showDebugBadge: boolean;
}) {
    return (
        <FamilySurface className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                <div className="flex items-center gap-2">
                    {showDebugBadge ? <FamilyDebugBadge /> : null}
                    <FamilyStatusChip
                        label={summary.title}
                        tone={summary.tone === "good" ? "success" : summary.tone === "warning" ? "warning" : "default"}
                    />
                </div>
            </div>
            <p className="text-sm leading-6 text-foreground-muted">{summary.message}</p>
            <div className="space-y-1">
                {metrics.map((metric) => (
                    <p key={metric} className="text-xs text-foreground-muted">
                        {metric}
                    </p>
                ))}
            </div>
            <Link href={route} className="inline-flex text-sm font-semibold text-sky-700">
                {title}으로 이동
            </Link>
        </FamilySurface>
    );
}

function StatusCardSkeleton() {
    return (
        <div className="rounded-[1.5rem] border border-sky-100 bg-white p-4 shadow-sm">
            <Skeleton className="h-4 w-20 rounded-lg" />
            <Skeleton className="mt-3 h-4 w-full rounded-lg" />
            <Skeleton className="mt-2 h-3 w-32 rounded-lg" />
            <Skeleton className="mt-1 h-3 w-28 rounded-lg" />
        </div>
    );
}
