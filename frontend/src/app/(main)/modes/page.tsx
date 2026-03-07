"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ModeCard from "@/components/features/modes/ModeCard";
import ModeUnlockDialog from "@/components/features/modes/ModeUnlockDialog";
import { AppShell } from "@/components/shared/AppShell";
import {
    FamilyPageIntro,
    FamilySectionTitle,
    FamilyStatusChip,
    FamilySurface,
} from "@/components/shared/FamilyUi";
import { Skeleton } from "@/components/ui/Skeleton";
import { MODE_CONFIG, type ModeConfig } from "@/lib/constants/modes";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
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

    const unlockedModes = useMemo(() => {
        const set = new Set(unlocks.map((unlock) => unlock.mode));
        set.add("basic");
        return set;
    }, [unlocks]);

    const pendingReservationCount = useMemo(
        () => myReservations.filter((reservation) => reservation.status === "pending").length,
        [myReservations]
    );
    const acceptedParticipantCount = useMemo(
        () => scheduleParticipants.filter((participant) => participant.status === "accepted").length,
        [scheduleParticipants]
    );

    const careSummary = useMemo(
        () =>
            summarizeCareProgress({
                hasError: isPartnerPlacesError || isReservationsError,
                placesCount: partnerPlaces.length,
                reservationsCount: myReservations.length,
                pendingReservationsCount: pendingReservationCount,
            }),
        [
            isPartnerPlacesError,
            isReservationsError,
            myReservations.length,
            partnerPlaces.length,
            pendingReservationCount,
        ]
    );
    const familySummary = useMemo(
        () =>
            summarizeFamilyProgress({
                hasError: isOwnershipsError || isParticipantsError,
                ownershipCount: dogOwnerships.length,
                participantsCount: scheduleParticipants.length,
                acceptedParticipantsCount: acceptedParticipantCount,
            }),
        [
            acceptedParticipantCount,
            dogOwnerships.length,
            isOwnershipsError,
            isParticipantsError,
            scheduleParticipants.length,
        ]
    );

    const isB2BSummaryLoading =
        isPartnerPlacesLoading || isReservationsLoading || isOwnershipsLoading || isParticipantsLoading;
    const hasB2BSummaryError =
        isPartnerPlacesError || isReservationsError || isOwnershipsError || isParticipantsError;

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
                    eyebrow="mode center"
                    title="모드 선택"
                    description="신뢰도와 준비 상태를 확인한 뒤, 상황에 맞는 운영 모드로 이동하세요."
                />

                <FamilySurface tone="soft" className="space-y-4">
                    <FamilySectionTitle
                        title="운영 준비 상태"
                        meta="care와 family 모드의 실행 준비도를 요약했습니다."
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
                                    다시 확인
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
                                title="Care"
                                summary={careSummary}
                                route="/care"
                                metrics={[
                                    `파트너 장소 ${partnerPlaces.length}곳`,
                                    `예약 ${myReservations.length}건`,
                                ]}
                            />
                            <ModeStatusCard
                                title="Family"
                                summary={familySummary}
                                route="/family"
                                metrics={[
                                    `소유 연결 ${dogOwnerships.length}건`,
                                    `공유 일정 참여 ${scheduleParticipants.length}건`,
                                ]}
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
}: {
    title: string;
    summary: ModeProgressSummary;
    route: string;
    metrics: string[];
}) {
    return (
        <FamilySurface className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                <FamilyStatusChip
                    label={summary.title}
                    tone={summary.tone === "good" ? "success" : summary.tone === "warning" ? "warning" : "default"}
                />
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
                {title} 열기
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
