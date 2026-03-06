"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import ModeCard from "@/components/features/modes/ModeCard";
import ModeUnlockDialog from "@/components/features/modes/ModeUnlockDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { MODE_CONFIG, type ModeConfig } from "@/lib/constants/modes";
import { useModeUnlocks } from "@/lib/hooks/useMode";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useMyReservations, usePartnerPlaces } from "@/lib/hooks/useCare";
import { useDogOwnerships, useMyScheduleParticipants } from "@/lib/hooks/useFamily";
import {
    getProgressToneClasses,
    summarizeCareProgress,
    summarizeFamilyProgress,
    type ModeProgressSummary,
} from "@/lib/modesProgress";
import { cn } from "@/lib/utils";

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
            partnerPlaces.length,
            myReservations.length,
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
            isOwnershipsError,
            isParticipantsError,
            dogOwnerships.length,
            scheduleParticipants.length,
            acceptedParticipantCount,
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
        const unlocked = isModeUnlocked(config);

        if (!unlocked) {
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
            <div className="px-4 py-6 space-y-6">
                <h1 className="text-2xl font-display font-bold text-foreground">Mode selection</h1>

                <section className="space-y-3 rounded-3xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-foreground">B2B execution status</h2>
                        {hasB2BSummaryError ? (
                            <button
                                type="button"
                                className="text-xs font-medium text-primary"
                                onClick={() => {
                                    void refetchPartnerPlaces();
                                    void refetchReservations();
                                    void refetchOwnerships();
                                    void refetchParticipants();
                                }}
                            >
                                Retry
                            </button>
                        ) : null}
                    </div>

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
                                    `Partner places ${partnerPlaces.length}`,
                                    `Reservations ${myReservations.length}`,
                                ]}
                            />
                            <ModeStatusCard
                                title="Family"
                                summary={familySummary}
                                route="/family"
                                metrics={[
                                    `Ownership links ${dogOwnerships.length}`,
                                    `Shared participants ${scheduleParticipants.length}`,
                                ]}
                            />
                        </div>
                    )}
                </section>

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

            {lockedMode && (
                <ModeUnlockDialog
                    isOpen={!!lockedMode}
                    onClose={() => setLockedMode(null)}
                    config={lockedMode}
                    currentLevel={trustLevel}
                    currentScore={trustScore}
                />
            )}
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
        <article className="rounded-2xl border border-border bg-background p-3">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <span
                    className={cn(
                        "rounded-full px-2 py-1 text-[11px] font-semibold",
                        getProgressToneClasses(summary.tone)
                    )}
                >
                    {summary.title}
                </span>
            </div>
            <p className="mt-2 text-xs text-foreground-muted">{summary.message}</p>
            <div className="mt-2 space-y-1">
                {metrics.map((metric) => (
                    <p key={metric} className="text-[11px] text-foreground-muted">
                        {metric}
                    </p>
                ))}
            </div>
            <div className="mt-3">
                <Link href={route} className="text-xs font-medium text-primary underline">
                    Open {title}
                </Link>
            </div>
        </article>
    );
}

function StatusCardSkeleton() {
    return (
        <div className="rounded-2xl border border-border bg-background p-3 space-y-2">
            <Skeleton className="h-4 w-20 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-3 w-24 rounded-lg" />
            <Skeleton className="h-3 w-28 rounded-lg" />
        </div>
    );
}
