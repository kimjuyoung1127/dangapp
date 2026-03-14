// File: Schedule page styled with the family organizer direction.
"use client";

import { useState } from "react";
import { Calendar, Clock, Footprints, MapPin, MessageSquarePlus } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import {
    FamilyEmptyPanel,
    FamilyPageIntro,
    FamilySectionTitle,
    FamilyStatusChip,
    FamilySurface,
} from "@/components/shared/FamilyUi";
import { Skeleton } from "@/components/ui/Skeleton";
import { TapScale, StaggerList, StaggerItem } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useMySchedules } from "@/lib/hooks/useSchedule";
import ReviewForm from "@/components/features/review/ReviewForm";
import WalkRecordForm from "@/components/features/walk/WalkRecordForm";
import type { ScheduleWithPartner } from "@/lib/hooks/useSchedule";

type TabType = "upcoming" | "completed" | "cancelled";

const TAB_MAP: Record<TabType, string[]> = {
    upcoming: ["proposed", "confirmed"],
    completed: ["completed"],
    cancelled: ["cancelled"],
};

const STATUS_CHIP: Record<
    ScheduleWithPartner["status"],
    { label: string; tone: "default" | "success" | "warning" | "danger" }
> = {
    proposed: { label: "제안", tone: "warning" },
    confirmed: { label: "확정", tone: "default" },
    completed: { label: "완료", tone: "success" },
    cancelled: { label: "취소", tone: "danger" },
};

export default function SchedulesPage() {
    const [activeTab, setActiveTab] = useState<TabType>("upcoming");
    const [reviewTarget, setReviewTarget] = useState<ScheduleWithPartner | null>(null);
    const [walkRecordTarget, setWalkRecordTarget] = useState<ScheduleWithPartner | null>(null);

    const { data: guardian } = useCurrentGuardian();
    const guardianId = guardian?.id;
    const { data: schedules, isLoading } = useMySchedules(guardianId);

    const filteredSchedules = (schedules ?? []).filter((schedule) => TAB_MAP[activeTab].includes(schedule.status));

    return (
        <AppShell>
            <div className="space-y-5 px-4 py-6">
                <FamilyPageIntro
                    eyebrow="산책 캘린더"
                    title="산책 일정"
                    description="날짜, 상태, 다음 액션을 먼저 보여주도록 정리했습니다."
                />

                <FamilySurface tone="soft">
                    <div role="tablist" className="flex gap-2 overflow-x-auto no-scrollbar">
                        {(["upcoming", "completed", "cancelled"] as TabType[]).map((tab) => (
                            <TapScale key={tab}>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={
                                        activeTab === tab
                                            ? "rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white"
                                            : "rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-medium text-foreground-muted"
                                    }
                                >
                                    {tab === "upcoming" ? "예정된 일정" : tab === "completed" ? "완료" : "취소됨"}
                                </button>
                            </TapScale>
                        ))}
                    </div>
                </FamilySurface>

                {isLoading ? (
                    <div className="space-y-4">
                        <ScheduleSkeleton />
                        <ScheduleSkeleton />
                    </div>
                ) : filteredSchedules.length === 0 ? (
                    <FamilyEmptyPanel message="해당 상태의 일정이 없습니다. 홈에서 새 산책 제안을 보내 보세요." />
                ) : (
                    <StaggerList className="space-y-4">
                        {filteredSchedules.map((schedule) => (
                            <StaggerItem key={schedule.id}>
                                <ScheduleCard
                                    schedule={schedule}
                                    onReview={() => setReviewTarget(schedule)}
                                    onWalkRecord={() => setWalkRecordTarget(schedule)}
                                />
                            </StaggerItem>
                        ))}
                    </StaggerList>
                )}

                {guardianId ? (
                    <ReviewForm
                        isOpen={!!reviewTarget}
                        onClose={() => setReviewTarget(null)}
                        authorId={guardianId}
                        targetId={reviewTarget?.partnerGuardianId ?? ""}
                        targetName={reviewTarget?.partnerName ?? ""}
                        scheduleId={reviewTarget?.id}
                    />
                ) : null}

                {guardianId ? (
                    <WalkRecordForm
                        isOpen={!!walkRecordTarget}
                        onClose={() => setWalkRecordTarget(null)}
                        authorId={guardianId}
                        scheduleId={walkRecordTarget?.id}
                        partnerGuardianId={walkRecordTarget?.partnerGuardianId}
                    />
                ) : null}
            </div>
        </AppShell>
    );
}

function ScheduleCard({
    schedule,
    onReview,
    onWalkRecord,
}: {
    schedule: ScheduleWithPartner;
    onReview: () => void;
    onWalkRecord: () => void;
}) {
    const dateObj = new Date(schedule.datetime);
    const dateStr = dateObj.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    const timeStr = dateObj.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    const isUpcoming = schedule.status === "proposed" || schedule.status === "confirmed";
    const daysUntil = isUpcoming ? Math.max(0, Math.ceil((dateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

    return (
        <FamilySurface>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">함께 걷는 일정</p>
                    <h3 className="mt-1 font-semibold text-foreground">{schedule.partnerName}</h3>
                    <p className="mt-1 text-sm text-foreground-muted">{schedule.title}</p>
                </div>
                {isUpcoming ? (
                    <FamilyStatusChip label={daysUntil === 0 ? "D-Day" : 'D-' + daysUntil} />
                ) : (
                    <FamilyStatusChip
                        label={STATUS_CHIP[schedule.status].label}
                        tone={STATUS_CHIP[schedule.status].tone}
                    />
                )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <FamilySurface tone="soft" className="p-3">
                    <FamilySectionTitle title="일정 정보" />
                    <div className="mt-3 space-y-2 text-sm text-foreground-muted">
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-sky-700" />{dateStr}</div>
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-sky-700" />{timeStr}</div>
                        {schedule.location_name ? (
                            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-sky-700" />{schedule.location_name}</div>
                        ) : null}
                    </div>
                </FamilySurface>
                <FamilySurface tone="soft" className="p-3">
                    <FamilySectionTitle title="상태 메모" />
                    <p className="mt-3 text-sm leading-6 text-foreground-muted">
                        {isUpcoming
                            ? "일정 전에 시간과 장소를 다시 확인해 두면 좋아요."
                            : schedule.status === "cancelled"
                              ? "취소된 일정입니다. 사유를 확인하고 다음 산책 제안을 다시 정리해 보세요."
                              : "완료된 일정은 산책 기록과 후기로 바로 정리할 수 있어요."}
                    </p>
                </FamilySurface>
            </div>

            {schedule.status === "completed" ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <Button variant="secondary" className="border border-sky-200 bg-white text-sky-700 hover:bg-sky-50" onClick={onWalkRecord}>
                        <Footprints className="mr-1.5 h-4 w-4" />산책 기록
                    </Button>
                    <Button variant="primary" className="bg-sky-600 text-white hover:bg-sky-700" onClick={onReview}>
                        <MessageSquarePlus className="mr-1.5 h-4 w-4" />후기 작성
                    </Button>
                </div>
            ) : null}
        </FamilySurface>
    );
}

function ScheduleSkeleton() {
    return (
        <FamilySurface className="space-y-4">
            <Skeleton className="h-5 w-28 rounded-xl" />
            <Skeleton className="h-24 w-full rounded-[1.5rem]" />
            <Skeleton className="h-12 w-full rounded-full" />
        </FamilySurface>
    );
}
