// File: Family page with debug demo fallback for development.
"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import FamilyGroupCard from "@/components/features/family/FamilyGroupCard";
import FamilyGroupForm from "@/components/features/family/FamilyGroupForm";
import { AppShell } from "@/components/shared/AppShell";
import {
    FamilyDebugBadge,
    FamilyEmptyPanel,
    FamilyPageIntro,
    FamilySectionTitle,
    FamilyStatusChip,
    FamilySurface,
} from "@/components/shared/FamilyUi";
import { Skeleton } from "@/components/ui/Skeleton";
import { StaggerItem, StaggerList, TapScale } from "@/components/ui/MotionWrappers";
import { shouldUseDebugCollectionFallback } from "@/lib/debugDemoFallback";
import { mapDogOwnershipsWithDogName, summarizeFamilyParticipants } from "@/lib/familyOverview";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useFamilyDebugDemo } from "@/lib/hooks/useDebugDemoFallback";
import {
    useDogOwnerships,
    useFamilyGroups,
    useFamilyMembers,
    useFamilySharedSchedules,
    useMyScheduleParticipants,
} from "@/lib/hooks/useFamily";
import type { Database } from "@/types/database.types";

type FamilyGroup = Database["public"]["Tables"]["family_groups"]["Row"];
type ParticipantStatus = Database["public"]["Tables"]["schedule_participants"]["Row"]["status"];
type ScheduleStatus = Database["public"]["Tables"]["schedules"]["Row"]["status"];
type OwnershipRole = Database["public"]["Tables"]["dog_ownership"]["Row"]["role"];

const PARTICIPANT_STATUS_LABELS: Record<ParticipantStatus, string> = {
    invited: "응답 대기",
    accepted: "참여 확정",
    declined: "참여 거절",
};

const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
    proposed: "제안됨",
    confirmed: "확정",
    completed: "완료",
    cancelled: "취소",
};

const OWNERSHIP_ROLE_LABELS: Record<OwnershipRole, string> = {
    owner: "대표 보호자",
    co_owner: "공동 보호자",
    sitter: "돌봄 담당",
};

export default function FamilyPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { data: guardian } = useCurrentGuardian();
    const guardianId = guardian?.id ?? "";

    const guardianDogs = useMemo(() => {
        const rawDogs = (guardian as { dogs?: Array<{ id: string; name?: string | null }> } | null)?.dogs;
        return Array.isArray(rawDogs) ? rawDogs.map((dog) => ({ id: dog.id, name: dog.name ?? dog.id })) : [];
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
    const { data: demoPayload } = useFamilyDebugDemo();

    const groupsFallbackActive = shouldUseDebugCollectionFallback({
        liveItems: groups,
        isError: isGroupsError,
        isLoading: isGroupsLoading,
        demoItems: demoPayload?.groups,
    });
    const ownershipsFallbackActive = shouldUseDebugCollectionFallback({
        liveItems: ownerships,
        isError: isOwnershipsError,
        isLoading: isOwnershipsLoading,
        demoItems: demoPayload?.ownerships,
    });
    const participantsFallbackActive = shouldUseDebugCollectionFallback({
        liveItems: participants,
        isError: isParticipantsError,
        isLoading: isParticipantsLoading,
        demoItems: demoPayload?.participants,
    });
    const sharedSchedulesFallbackActive = shouldUseDebugCollectionFallback({
        liveItems: sharedSchedules,
        isError: isParticipantsError || isSharedSchedulesError,
        isLoading: isParticipantsLoading || isSharedSchedulesLoading,
        demoItems: demoPayload?.sharedSchedules,
    });

    const resolvedGroups = useMemo(
        () => (groupsFallbackActive ? demoPayload?.groups ?? [] : groups),
        [demoPayload?.groups, groups, groupsFallbackActive]
    );
    const resolvedOwnerships = useMemo(
        () => (ownershipsFallbackActive ? demoPayload?.ownerships ?? [] : ownerships),
        [demoPayload?.ownerships, ownerships, ownershipsFallbackActive]
    );
    const resolvedParticipants = useMemo(
        () => (participantsFallbackActive ? demoPayload?.participants ?? [] : participants),
        [demoPayload?.participants, participants, participantsFallbackActive]
    );
    const resolvedSharedSchedules = useMemo(
        () => (sharedSchedulesFallbackActive ? demoPayload?.sharedSchedules ?? [] : sharedSchedules),
        [demoPayload?.sharedSchedules, sharedSchedules, sharedSchedulesFallbackActive]
    );
    const resolvedDogs = useMemo(
        () => (ownershipsFallbackActive ? demoPayload?.dogs ?? guardianDogs : guardianDogs),
        [demoPayload?.dogs, guardianDogs, ownershipsFallbackActive]
    );
    const resolvedMemberCounts = groupsFallbackActive ? demoPayload?.memberCounts ?? {} : {};

    const ownershipViewModels = useMemo(
        () => mapDogOwnershipsWithDogName(resolvedOwnerships, resolvedDogs),
        [resolvedOwnerships, resolvedDogs]
    );
    const participantMetrics = useMemo(
        () => summarizeFamilyParticipants(resolvedParticipants),
        [resolvedParticipants]
    );

    return (
        <AppShell>
            <div className="space-y-5 px-4 py-6">
                <FamilyPageIntro
                    eyebrow="함께 돌봄"
                    title="함께 돌봄"
                    description="공동 돌봄, 일정, 그룹 현황을 한 화면에서 보기 쉽게 정리해 드려요."
                    backHref="/modes"
                    action={
                        <TapScale>
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(true)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-700"
                            >
                                <Plus className="h-4 w-4" />
                                그룹 만들기
                            </button>
                        </TapScale>
                    }
                />

                <section className="grid grid-cols-3 gap-3">
                    <SummaryCard label="공동 돌봄" value={resolvedOwnerships.length} />
                    <SummaryCard label="참여 확정" value={participantMetrics.accepted} />
                    <SummaryCard label="응답 대기" value={participantMetrics.invited} />
                </section>

                <section className="space-y-3">
                    <FamilySectionTitle
                        title="공동 돌봄 반려견"
                        meta="현재 함께 돌보고 있는 반려견과 역할을 확인해 보세요."
                        action={ownershipsFallbackActive ? <FamilyDebugBadge /> : undefined}
                    />
                    {isOwnershipsLoading && !ownershipsFallbackActive ? (
                        <div className="space-y-3">
                            <Skeleton className="h-20 w-full rounded-[1.75rem]" />
                            <Skeleton className="h-20 w-full rounded-[1.75rem]" />
                        </div>
                    ) : isOwnershipsError && !ownershipsFallbackActive ? (
                        <FamilyEmptyPanel
                            message="공동 돌봄 정보를 불러오지 못했어요."
                            action={
                                <button
                                    className="text-sm font-medium text-sky-700 underline"
                                    onClick={() => void refetchOwnerships()}
                                >
                                    다시 불러오기
                                </button>
                            }
                        />
                    ) : ownershipViewModels.length === 0 ? (
                        <FamilyEmptyPanel message="아직 연결된 공동 돌봄 반려견이 없어요." />
                    ) : (
                        <div className="space-y-3">
                            {ownershipViewModels.map((ownership) => (
                                <FamilySurface key={`${ownership.dogId}-${ownership.role}`}>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-foreground">{ownership.dogName}</h3>
                                            <p className="mt-1 text-sm text-foreground-muted">
                                                {ownership.isPrimary ? "주 보호자로 연결됨" : "함께 돌보는 보호자로 연결됨"}
                                            </p>
                                        </div>
                                        <FamilyStatusChip label={OWNERSHIP_ROLE_LABELS[ownership.role]} />
                                    </div>
                                </FamilySurface>
                            ))}
                        </div>
                    )}
                </section>

                <section className="space-y-3">
                    <FamilySectionTitle
                        title="함께 보는 일정"
                        meta="참여 상태와 일정 상태를 같이 보면서 현재 진행 상황을 확인할 수 있어요."
                        action={sharedSchedulesFallbackActive ? <FamilyDebugBadge /> : undefined}
                    />
                    {(isParticipantsLoading || isSharedSchedulesLoading) && !sharedSchedulesFallbackActive ? (
                        <div className="space-y-3">
                            <Skeleton className="h-24 w-full rounded-[1.75rem]" />
                            <Skeleton className="h-24 w-full rounded-[1.75rem]" />
                        </div>
                    ) : (isParticipantsError || isSharedSchedulesError) && !sharedSchedulesFallbackActive ? (
                        <FamilyEmptyPanel
                            message="공유 일정 내역을 불러오지 못했어요."
                            action={
                                <button
                                    className="text-sm font-medium text-sky-700 underline"
                                    onClick={() => {
                                        void refetchParticipants();
                                        void refetchSharedSchedules();
                                    }}
                                >
                                    다시 불러오기
                                </button>
                            }
                        />
                    ) : resolvedSharedSchedules.length === 0 ? (
                        <FamilyEmptyPanel message="아직 함께 잡은 일정이 없어요." />
                    ) : (
                        <div className="space-y-3">
                            {resolvedSharedSchedules.map((schedule) => (
                                <FamilySurface key={`${schedule.schedule_id}-${schedule.joined_at}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-foreground">{schedule.title}</h3>
                                            <p className="mt-1 text-sm text-foreground-muted">
                                                {new Date(schedule.datetime).toLocaleString("ko-KR")}
                                            </p>
                                            <p className="mt-1 text-xs text-foreground-muted">
                                                일정 상태: {SCHEDULE_STATUS_LABELS[schedule.schedule_status]}
                                            </p>
                                        </div>
                                        <FamilyStatusChip
                                            label={PARTICIPANT_STATUS_LABELS[schedule.participant_status]}
                                            tone={
                                                schedule.participant_status === "accepted"
                                                    ? "success"
                                                    : schedule.participant_status === "declined"
                                                      ? "danger"
                                                      : "warning"
                                            }
                                        />
                                    </div>
                                </FamilySurface>
                            ))}
                        </div>
                    )}
                </section>

                <section className="space-y-3">
                    <FamilySectionTitle
                        title="돌봄 그룹"
                        meta="함께 돌보는 사람들과 반려견을 그룹으로 묶어 관리할 수 있어요."
                        action={
                            groupsFallbackActive ? (
                                <FamilyDebugBadge />
                            ) : isGroupsError ? (
                                <button
                                    className="text-sm font-medium text-sky-700 underline"
                                    onClick={() => void refetchGroups()}
                                >
                                    다시 불러오기
                                </button>
                            ) : undefined
                        }
                    />
                    {isGroupsLoading && !groupsFallbackActive ? (
                        <div className="space-y-4">
                            <FamilyGroupSkeleton />
                            <FamilyGroupSkeleton />
                        </div>
                    ) : isGroupsError && !groupsFallbackActive ? (
                        <FamilyEmptyPanel message="돌봄 그룹을 불러오지 못했어요." />
                    ) : resolvedGroups.length === 0 ? (
                        <FamilyEmptyPanel message="아직 만든 돌봄 그룹이 없어요." />
                    ) : (
                        <StaggerList className="space-y-4" animateOnMount={false}>
                            {resolvedGroups.map((group) =>
                                groupsFallbackActive ? (
                                    <StaggerItem key={group.id}>
                                        <FamilyGroupCard
                                            group={group}
                                            memberCount={resolvedMemberCounts[group.id] ?? 0}
                                        />
                                    </StaggerItem>
                                ) : (
                                    <FamilyGroupCardWithCount key={group.id} group={group} />
                                )
                            )}
                        </StaggerList>
                    )}
                </section>
            </div>

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
            <FamilyGroupCard group={group} memberCount={isError ? 0 : members.length} memberCountError={isError} />
        </StaggerItem>
    );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
    return (
        <FamilySurface className="px-3 py-3 text-center">
            <p className="text-xs text-foreground-muted">{label}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
        </FamilySurface>
    );
}

function FamilyGroupSkeleton() {
    return <Skeleton className="h-32 w-full rounded-[1.75rem]" />;
}
