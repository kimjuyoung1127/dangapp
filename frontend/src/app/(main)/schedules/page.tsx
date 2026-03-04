// schedules/page.tsx — 내 약속 페이지 (실데이터 바인딩, DANG-WLK-001)

"use client";

import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { TapScale, StaggerList, StaggerItem } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
import { Calendar, MapPin, Clock, Footprints, MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";
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

export default function SchedulesPage() {
    const [activeTab, setActiveTab] = useState<TabType>("upcoming");
    const [reviewTarget, setReviewTarget] = useState<ScheduleWithPartner | null>(null);
    const [walkRecordTarget, setWalkRecordTarget] = useState<ScheduleWithPartner | null>(null);

    const { data: guardian } = useCurrentGuardian();
    const guardianId = guardian?.id;
    const { data: schedules, isLoading } = useMySchedules(guardianId);

    const filteredSchedules = (schedules ?? []).filter((s) =>
        TAB_MAP[activeTab].includes(s.status)
    );

    return (
        <AppShell>
            <div className="flex flex-col h-full bg-background">
                <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 bg-background/80 backdrop-blur-md px-4 h-14 flex items-center border-b border-border">
                    <h1 className="text-xl font-bold font-display text-foreground">내 약속</h1>
                </header>

                {/* 탭 네비게이션 */}
                <div role="tablist" className="px-4 py-3 bg-background sticky top-14 z-30 flex gap-2 overflow-x-auto no-scrollbar">
                    {(["upcoming", "completed", "cancelled"] as TabType[]).map((tab) => (
                        <TapScale key={tab}>
                            <button
                                role="tab"
                                aria-selected={activeTab === tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-[14px] font-medium transition-colors whitespace-nowrap",
                                    activeTab === tab
                                        ? "bg-foreground text-background"
                                        : "bg-gray-100 text-foreground-muted hover:bg-gray-200"
                                )}
                            >
                                {tab === "upcoming" ? "예정된 약속" : tab === "completed" ? "완료" : "취소됨"}
                            </button>
                        </TapScale>
                    ))}
                </div>

                {/* 리스트 영역 */}
                <main className="flex-1 px-4 py-2">
                    {isLoading ? (
                        <div className="space-y-4">
                            <ScheduleSkeleton />
                            <ScheduleSkeleton />
                        </div>
                    ) : filteredSchedules.length === 0 ? (
                        <div className="h-40 flex items-center justify-center text-foreground-muted text-sm">
                            해당하는 약속이 없습니다.
                        </div>
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
                </main>

                {/* 후기 작성 BottomSheet */}
                {guardianId && (
                    <ReviewForm
                        isOpen={!!reviewTarget}
                        onClose={() => setReviewTarget(null)}
                        authorId={guardianId}
                        targetId={reviewTarget?.partnerGuardianId ?? ""}
                        targetName={reviewTarget?.partnerName ?? ""}
                        scheduleId={reviewTarget?.id}
                    />
                )}

                {/* 산책 기록 작성 BottomSheet */}
                {guardianId && (
                    <WalkRecordForm
                        isOpen={!!walkRecordTarget}
                        onClose={() => setWalkRecordTarget(null)}
                        authorId={guardianId}
                        scheduleId={walkRecordTarget?.id}
                        partnerGuardianId={walkRecordTarget?.partnerGuardianId}
                    />
                )}
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
    const dateStr = dateObj.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
    const timeStr = dateObj.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

    const isUpcoming = schedule.status === "proposed" || schedule.status === "confirmed";
    const daysUntil = isUpcoming
        ? Math.max(0, Math.ceil((dateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

    return (
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-light/30 flex items-center justify-center text-primary font-bold">
                        {schedule.partnerName[0]}
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground text-[15px]">{schedule.partnerName}</h3>
                        <span className="text-[12px] text-foreground-muted">
                            {schedule.title}
                        </span>
                    </div>
                </div>

                {isUpcoming && (
                    <span className="px-2.5 py-1 bg-primary-light/20 text-primary text-[11px] font-bold rounded-full">
                        {daysUntil === 0 ? "D-Day" : `D-${daysUntil}`}
                    </span>
                )}
            </div>

            <div className="space-y-2.5 bg-muted/50 rounded-xl p-3.5 border border-border">
                <div className="flex items-center gap-2 text-sm text-foreground-muted">
                    <Calendar className="w-4 h-4 text-primary/70" />
                    <span>{dateStr}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground-muted">
                    <Clock className="w-4 h-4 text-primary/70" />
                    <span>{timeStr}</span>
                </div>
                {schedule.location_name && (
                    <div className="flex items-center gap-2 text-sm text-foreground-muted">
                        <MapPin className="w-4 h-4 text-primary/70" />
                        <span>{schedule.location_name}</span>
                    </div>
                )}
            </div>

            {schedule.status === "completed" && (
                <div className="mt-4 pt-4 border-t border-border flex gap-2">
                    <TapScale className="flex-1">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="w-full"
                            onClick={onWalkRecord}
                        >
                            <Footprints className="w-4 h-4 mr-1.5" />
                            산책 기록
                        </Button>
                    </TapScale>
                    <TapScale className="flex-1">
                        <Button
                            variant="primary"
                            size="sm"
                            className="w-full"
                            onClick={onReview}
                        >
                            <MessageSquarePlus className="w-4 h-4 mr-1.5" />
                            후기 작성
                        </Button>
                    </TapScale>
                </div>
            )}
        </div>
    );
}

function ScheduleSkeleton() {
    return (
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-4">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20 rounded-xl" />
                        <Skeleton className="h-3 w-32 rounded-xl" />
                    </div>
                </div>
            </div>
            <div className="space-y-2.5 bg-muted/50 rounded-xl p-3.5 border border-border">
                <Skeleton className="h-4 w-1/2 rounded-xl" />
                <Skeleton className="h-4 w-1/3 rounded-xl" />
                <Skeleton className="h-4 w-2/3 rounded-xl" />
            </div>
        </div>
    );
}
