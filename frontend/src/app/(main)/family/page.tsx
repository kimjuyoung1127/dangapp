// File: Family page styled with the family organizer direction.
"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import { FamilyEmptyPanel, FamilyPageIntro, FamilySectionTitle, FamilyStatusChip, FamilySurface } from "@/components/shared/FamilyUi";
import { Skeleton } from "@/components/ui/Skeleton";
import { StaggerItem, StaggerList, TapScale } from "@/components/ui/MotionWrappers";
import FamilyGroupCard from "@/components/features/family/FamilyGroupCard";
import FamilyGroupForm from "@/components/features/family/FamilyGroupForm";
import { useDogOwnerships, useFamilyGroups, useFamilyMembers, useFamilySharedSchedules, useMyScheduleParticipants } from "@/lib/hooks/useFamily";
import { mapDogOwnershipsWithDogName, summarizeFamilyParticipants } from "@/lib/familyOverview";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import type { Database } from "@/types/database.types";

type FamilyGroup = Database["public"]["Tables"]["family_groups"]["Row"];
type ParticipantStatus = Database["public"]["Tables"]["schedule_participants"]["Row"]["status"];
type ScheduleStatus = Database["public"]["Tables"]["schedules"]["Row"]["status"];

const PARTICIPANT_STATUS_LABELS: Record<ParticipantStatus, string> = {
    invited: "초대됨",
    accepted: "수락됨",
    declined: "거절됨",
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
        return Array.isArray(rawDogs) ? rawDogs.map((dog) => ({ id: dog.id, name: dog.name ?? dog.id })) : [];
    }, [guardian]);

    const { data: groups = [], isLoading: isGroupsLoading, isError: isGroupsError, refetch: refetchGroups } = useFamilyGroups(guardianId);
    const { data: ownerships = [], isLoading: isOwnershipsLoading, isError: isOwnershipsError, refetch: refetchOwnerships } = useDogOwnerships(guardianId);
    const { data: participants = [], isLoading: isParticipantsLoading, isError: isParticipantsError, refetch: refetchParticipants } = useMyScheduleParticipants(guardianId);
    const { data: sharedSchedules = [], isLoading: isSharedSchedulesLoading, isError: isSharedSchedulesError, refetch: refetchSharedSchedules } = useFamilySharedSchedules(guardianId);

    const ownershipViewModels = useMemo(() => mapDogOwnershipsWithDogName(ownerships, guardianDogs), [ownerships, guardianDogs]);
    const participantMetrics = useMemo(() => summarizeFamilyParticipants(participants), [participants]);

    return (
        <AppShell>
            <div className="space-y-5 px-4 py-6">
                <FamilyPageIntro
                    eyebrow="family collaboration hub"
                    title="Family mode"
                    description="공동 양육, 공유 일정, 가족 그룹을 한 방향의 카드 시스템으로 정리했습니다."
                    backHref="/modes"
                    action={
                        <TapScale>
                            <button type="button" onClick={() => setIsFormOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-700">
                                <Plus className="h-4 w-4" />그룹 만들기
                            </button>
                        </TapScale>
                    }
                />

                <section className="grid grid-cols-3 gap-3">
                    <SummaryCard label="공동양육" value={ownerships.length} />
                    <SummaryCard label="일정 수락" value={participantMetrics.accepted} />
                    <SummaryCard label="일정 초대" value={participantMetrics.invited} />
                </section>

                <section className="space-y-3">
                    <FamilySectionTitle title="공동 양육 반려견" meta="현재 연결된 반려견과 역할을 확인합니다." />
                    {isOwnershipsLoading ? (
                        <div className="space-y-3"><Skeleton className="h-20 w-full rounded-[1.75rem]" /><Skeleton className="h-20 w-full rounded-[1.75rem]" /></div>
                    ) : isOwnershipsError ? (
                        <FamilyEmptyPanel message="공동 양육 정보를 불러오지 못했어요." action={<button className="text-sm font-medium text-sky-700 underline" onClick={() => void refetchOwnerships()}>다시 불러오기</button>} />
                    ) : ownershipViewModels.length === 0 ? (
                        <FamilyEmptyPanel message="연결된 공동 양육 반려견이 없습니다." />
                    ) : (
                        <div className="space-y-3">
                            {ownershipViewModels.map((ownership) => (
                                <FamilySurface key={`${ownership.dogId}-${ownership.role}`}> 
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-foreground">{ownership.dogName}</h3>
                                            <p className="mt-1 text-sm text-foreground-muted">{ownership.isPrimary ? "대표 보호자" : "공동 보호자"}</p>
                                        </div>
                                        <FamilyStatusChip label={ownership.role} />
                                    </div>
                                </FamilySurface>
                            ))}
                        </div>
                    )}
                </section>

                <section className="space-y-3">
                    <FamilySectionTitle title="공유 일정 참여" meta="수락 여부와 일정 상태를 함께 보여줍니다." />
                    {isParticipantsLoading || isSharedSchedulesLoading ? (
                        <div className="space-y-3"><Skeleton className="h-24 w-full rounded-[1.75rem]" /><Skeleton className="h-24 w-full rounded-[1.75rem]" /></div>
                    ) : isParticipantsError || isSharedSchedulesError ? (
                        <FamilyEmptyPanel message="공유 일정 참여 내역을 불러오지 못했어요." action={<button className="text-sm font-medium text-sky-700 underline" onClick={() => { void refetchParticipants(); void refetchSharedSchedules(); }}>다시 불러오기</button>} />
                    ) : sharedSchedules.length === 0 ? (
                        <FamilyEmptyPanel message="아직 참여 중인 공유 일정이 없습니다." />
                    ) : (
                        <div className="space-y-3">
                            {sharedSchedules.map((schedule) => (
                                <FamilySurface key={`${schedule.schedule_id}-${schedule.joined_at}`}> 
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-foreground">{schedule.title}</h3>
                                            <p className="mt-1 text-sm text-foreground-muted">{new Date(schedule.datetime).toLocaleString("ko-KR")}</p>
                                            <p className="mt-1 text-xs text-foreground-muted">일정 상태: {SCHEDULE_STATUS_LABELS[schedule.schedule_status]}</p>
                                        </div>
                                        <FamilyStatusChip
                                            label={PARTICIPANT_STATUS_LABELS[schedule.participant_status]}
                                            tone={schedule.participant_status === "accepted" ? "success" : schedule.participant_status === "declined" ? "danger" : "warning"}
                                        />
                                    </div>
                                </FamilySurface>
                            ))}
                        </div>
                    )}
                </section>

                <section className="space-y-3">
                    <FamilySectionTitle title="가족 그룹" meta="기존 그룹과 멤버 수를 같은 카드 계열로 보여줍니다." action={isGroupsError ? <button className="text-sm font-medium text-sky-700 underline" onClick={() => void refetchGroups()}>다시 불러오기</button> : undefined} />
                    {isGroupsLoading ? (
                        <div className="space-y-4"><FamilyGroupSkeleton /><FamilyGroupSkeleton /></div>
                    ) : isGroupsError ? (
                        <FamilyEmptyPanel message="가족 그룹을 불러오지 못했어요." />
                    ) : groups.length === 0 ? (
                        <FamilyEmptyPanel message="아직 가족 그룹이 없습니다." />
                    ) : (
                        <StaggerList className="space-y-4" animateOnMount={false}>
                            {groups.map((group) => (
                                <FamilyGroupCardWithCount key={group.id} group={group} />
                            ))}
                        </StaggerList>
                    )}
                </section>
            </div>

            {guardian ? <FamilyGroupForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} creatorId={guardian.id} /> : null}
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
