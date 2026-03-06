// File: Family page with ownership/participant data and family-group management flow.
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { StaggerItem, StaggerList, TapScale } from "@/components/ui/MotionWrappers";
import FamilyGroupCard from "@/components/features/family/FamilyGroupCard";
import FamilyGroupForm from "@/components/features/family/FamilyGroupForm";
import {
    useDogOwnerships,
    useFamilyGroups,
    useFamilyMembers,
    useFamilySharedSchedules,
    useMyScheduleParticipants,
} from "@/lib/hooks/useFamily";
import {
    mapDogOwnershipsWithDogName,
    summarizeFamilyParticipants,
} from "@/lib/familyOverview";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type FamilyGroup = Database["public"]["Tables"]["family_groups"]["Row"];
type ScheduleStatus = Database["public"]["Tables"]["schedules"]["Row"]["status"];

type ParticipantStatus =
    Database["public"]["Tables"]["schedule_participants"]["Row"]["status"];

const PARTICIPANT_STATUS_LABELS: Record<ParticipantStatus, string> = {
    invited: "초대됨",
    accepted: "수락",
    declined: "거절",
};

const PARTICIPANT_STATUS_COLORS: Record<ParticipantStatus, string> = {
    invited: "text-amber-700 bg-amber-50",
    accepted: "text-green-700 bg-green-50",
    declined: "text-red-700 bg-red-50",
};

const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
    proposed: "제안",
    confirmed: "확정",
    completed: "완료",
    cancelled: "취소",
};

export default function FamilyPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: guardian } = useCurrentGuardian();
    const guardianId = guardian?.id ?? "";

    const guardianDogs = useMemo(() => {
        const rawDogs = (guardian as { dogs?: Array<{ id: string; name?: string | null }> } | null)?.dogs;
        if (!Array.isArray(rawDogs)) return [] as Array<{ id: string; name: string }>;

        return rawDogs.map((dog) => ({
            id: dog.id,
            name: dog.name ?? dog.id,
        }));
    }, [guardian]);

    const {
        data: groups = [],
        isLoading: isGroupsLoading,
        isError: isGroupsError,
        refetch: refetchGroups,
    } = useFamilyGroups(guardianId);

    const {
        data: ownerships = [],
        isLoading: isOwnershipsLoading,
        isError: isOwnershipsError,
        refetch: refetchOwnerships,
    } = useDogOwnerships(guardianId);

    const {
        data: participants = [],
        isLoading: isParticipantsLoading,
        isError: isParticipantsError,
        refetch: refetchParticipants,
    } = useMyScheduleParticipants(guardianId);

    const {
        data: sharedSchedules = [],
        isLoading: isSharedSchedulesLoading,
        isError: isSharedSchedulesError,
        refetch: refetchSharedSchedules,
    } = useFamilySharedSchedules(guardianId);

    const ownershipViewModels = useMemo(
        () => mapDogOwnershipsWithDogName(ownerships, guardianDogs),
        [ownerships, guardianDogs]
    );

    const participantMetrics = useMemo(
        () => summarizeFamilyParticipants(participants),
        [participants]
    );

    return (
        <AppShell>
            <div className="space-y-8 px-4 py-6">
                <div className="flex items-center gap-3">
                    <Link href="/modes">
                        <ArrowLeft className="h-5 w-5 text-foreground-muted" />
                    </Link>
                    <h1 className="text-2xl font-display font-bold text-foreground">Family mode</h1>
                </div>

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">가족 공유 요약</h2>
                    <div className="grid grid-cols-3 gap-2">
                        <SummaryCard label="공동양육" value={ownerships.length} />
                        <SummaryCard label="일정수락" value={participantMetrics.accepted} />
                        <SummaryCard label="일정초대" value={participantMetrics.invited} />
                    </div>
                </section>

                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">공동 양육 반려견</h2>
                        {isOwnershipsError ? (
                            <button
                                type="button"
                                className="text-xs font-medium text-primary"
                                onClick={() => {
                                    void refetchOwnerships();
                                }}
                            >
                                다시 불러오기
                            </button>
                        ) : null}
                    </div>

                    {isOwnershipsLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-16 w-full rounded-2xl" />
                            <Skeleton className="h-16 w-full rounded-2xl" />
                        </div>
                    ) : null}

                    {isOwnershipsError && !isOwnershipsLoading ? (
                        <InlineError
                            message="공동 양육 정보를 불러오지 못했습니다."
                            actionLabel="소유권 다시 불러오기"
                            onRetry={() => {
                                void refetchOwnerships();
                            }}
                        />
                    ) : null}

                    {!isOwnershipsLoading && !isOwnershipsError && ownershipViewModels.length === 0 ? (
                        <p className="rounded-2xl border border-border bg-card p-4 text-sm text-foreground-muted">
                            연결된 공동 양육 반려견이 없습니다.
                        </p>
                    ) : null}

                    {ownershipViewModels.length > 0 ? (
                        <div className="space-y-2">
                            {ownershipViewModels.map((ownership) => (
                                <article
                                    key={`${ownership.dogId}-${ownership.role}`}
                                    className="rounded-2xl border border-border bg-card p-4"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium text-foreground">{ownership.dogName}</p>
                                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                            {ownership.role}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-foreground-muted">
                                        {ownership.isPrimary ? "대표 보호자" : "공동 보호자"}
                                    </p>
                                </article>
                            ))}
                        </div>
                    ) : null}
                </section>

                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">공유 일정 참여</h2>
                        {(isParticipantsError || isSharedSchedulesError) && (
                            <button
                                type="button"
                                className="text-xs font-medium text-primary"
                                onClick={() => {
                                    void refetchParticipants();
                                    void refetchSharedSchedules();
                                }}
                            >
                                다시 불러오기
                            </button>
                        )}
                    </div>

                    {isParticipantsLoading || isSharedSchedulesLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-20 w-full rounded-2xl" />
                            <Skeleton className="h-20 w-full rounded-2xl" />
                        </div>
                    ) : null}

                    {(isParticipantsError || isSharedSchedulesError) &&
                    !isParticipantsLoading &&
                    !isSharedSchedulesLoading ? (
                        <InlineError
                            message="공유 일정 참여 내역을 불러오지 못했습니다."
                            actionLabel="참여 일정 다시 불러오기"
                            onRetry={() => {
                                void refetchParticipants();
                                void refetchSharedSchedules();
                            }}
                        />
                    ) : null}

                    {!isParticipantsLoading &&
                    !isSharedSchedulesLoading &&
                    !isParticipantsError &&
                    !isSharedSchedulesError &&
                    sharedSchedules.length === 0 ? (
                        <p className="rounded-2xl border border-border bg-card p-4 text-sm text-foreground-muted">
                            아직 참여한 공유 일정이 없습니다.
                        </p>
                    ) : null}

                    {sharedSchedules.length > 0 ? (
                        <div className="space-y-2">
                            {sharedSchedules.map((schedule) => (
                                <article
                                    key={`${schedule.schedule_id}-${schedule.joined_at}`}
                                    className="rounded-2xl border border-border bg-card p-4"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium text-foreground">{schedule.title}</p>
                                        <span
                                            className={cn(
                                                "rounded-full px-2 py-1 text-xs font-medium",
                                                PARTICIPANT_STATUS_COLORS[schedule.participant_status]
                                            )}
                                        >
                                            {PARTICIPANT_STATUS_LABELS[schedule.participant_status]}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-foreground-muted">
                                        일정 상태: {SCHEDULE_STATUS_LABELS[schedule.schedule_status]}
                                    </p>
                                    <p className="text-xs text-foreground-muted">
                                        일정 시간: {new Date(schedule.datetime).toLocaleString("ko-KR")}
                                    </p>
                                </article>
                            ))}
                        </div>
                    ) : null}
                </section>

                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">가족 그룹</h2>
                        <TapScale>
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(true)}
                                className="text-sm font-medium text-primary"
                            >
                                그룹 만들기
                            </button>
                        </TapScale>
                    </div>

                    {isGroupsLoading ? (
                        <div className="space-y-4">
                            <FamilyGroupSkeleton />
                            <FamilyGroupSkeleton />
                        </div>
                    ) : isGroupsError ? (
                        <InlineError
                            message="가족 그룹을 불러오지 못했습니다."
                            actionLabel="그룹 다시 불러오기"
                            onRetry={() => {
                                void refetchGroups();
                            }}
                        />
                    ) : groups.length === 0 ? (
                        <p className="rounded-2xl border border-border bg-card p-4 text-sm text-foreground-muted">
                            아직 가족 그룹이 없습니다.
                        </p>
                    ) : (
                        <StaggerList className="space-y-4" animateOnMount={false}>
                            {groups.map((group) => (
                                <FamilyGroupCardWithCount key={group.id} group={group} />
                            ))}
                        </StaggerList>
                    )}
                </section>
            </div>

            <TapScale className="fixed bottom-24 right-6 z-20">
                <button
                    type="button"
                    onClick={() => setIsFormOpen(true)}
                    aria-label="Create family group"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg"
                >
                    <Plus className="h-6 w-6" />
                </button>
            </TapScale>

            {guardian ? (
                <FamilyGroupForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    creatorId={guardian.id}
                />
            ) : null}
        </AppShell>
    );
}

function FamilyGroupCardWithCount({ group }: { group: FamilyGroup }) {
    const { data: members = [], isError } = useFamilyMembers(group.id);

    return (
        <StaggerItem>
            <FamilyGroupCard
                group={group}
                memberCount={isError ? 0 : members.length}
                memberCountError={isError}
            />
        </StaggerItem>
    );
}

function FamilyGroupSkeleton() {
    return (
        <div className="flex items-center justify-between rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32 rounded-xl" />
                    <Skeleton className="h-4 w-20 rounded-xl" />
                </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
    );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
    return (
        <article className="rounded-2xl border border-border bg-card px-3 py-3">
            <p className="text-xs text-foreground-muted">{label}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
        </article>
    );
}

function InlineError({
    message,
    actionLabel,
    onRetry,
}: {
    message: string;
    actionLabel: string;
    onRetry: () => void;
}) {
    return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{message}</p>
            <button
                type="button"
                className="mt-2 font-medium underline"
                onClick={onRetry}
            >
                {actionLabel}
            </button>
        </div>
    );
}
