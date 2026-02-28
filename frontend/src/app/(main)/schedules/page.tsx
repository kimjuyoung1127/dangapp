"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { TapScale, StaggerList, StaggerItem } from "@/components/ui/MotionWrappers";
import { Calendar, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import ReviewForm from "@/components/features/review/ReviewForm";

type TabType = "upcoming" | "completed" | "cancelled";

const dummySchedules = [
    {
        id: 1,
        partnerName: "초코언니",
        date: "2026-03-01",
        time: "14:30",
        location: "뚝섬유원지 한강공원",
        status: "upcoming"
    },
    {
        id: 2,
        partnerName: "맥스아빠",
        date: "2026-02-25",
        time: "10:00",
        location: "서울숲 반려동물 놀이터",
        status: "completed"
    },
    {
        id: 3,
        partnerName: "보리엄마",
        date: "2026-02-20",
        time: "16:00",
        location: "반포 한강공원",
        status: "cancelled"
    }
];

export default function SchedulesPage() {
    const [activeTab, setActiveTab] = useState<TabType>("upcoming");
    const [reviewTarget, setReviewTarget] = useState<{
        id: number;
        partnerName: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 임시 로딩 시뮬레이션
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const filteredSchedules = dummySchedules.filter(s => s.status === activeTab);

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
                                    <div className="bg-card rounded-3xl p-5 border border-border shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-light/30 flex items-center justify-center text-primary font-bold">
                                                    {schedule.partnerName[0]}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground text-[15px]">{schedule.partnerName}</h3>
                                                    <span className="text-[12px] text-foreground-muted">반려견 산책 메이트</span>
                                                </div>
                                            </div>

                                            {schedule.status === "upcoming" && (
                                                <span className="px-2.5 py-1 bg-primary-light/20 text-primary text-[11px] font-bold rounded-full">
                                                    D-{Math.max(0, new Date(schedule.date).getDate() - new Date().getDate()) || 'Day'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-2.5 bg-muted/50 rounded-xl p-3.5 border border-border">
                                            <div className="flex items-center gap-2 text-sm text-foreground-muted">
                                                <Calendar className="w-4 h-4 text-primary/70" />
                                                <span>{schedule.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-foreground-muted">
                                                <Clock className="w-4 h-4 text-primary/70" />
                                                <span>{schedule.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-foreground-muted">
                                                <MapPin className="w-4 h-4 text-primary/70" />
                                                <span>{schedule.location}</span>
                                            </div>
                                        </div>

                                        {schedule.status === "completed" && (
                                            <div className="mt-4 pt-4 border-t border-border">
                                                <TapScale>
                                                    <button
                                                        onClick={() => setReviewTarget({ id: schedule.id, partnerName: schedule.partnerName })}
                                                        className="w-full py-2.5 bg-primary/10 text-primary font-medium text-sm rounded-xl"
                                                    >
                                                        후기 작성하기
                                                    </button>
                                                </TapScale>
                                            </div>
                                        )}
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerList>
                    )}
                </main>

                {/* 후기 작성 BottomSheet */}
                <ReviewForm
                    isOpen={!!reviewTarget}
                    onClose={() => setReviewTarget(null)}
                    authorId="mock-current-user"
                    targetId={`mock-partner-${reviewTarget?.id ?? ""}`}
                    targetName={reviewTarget?.partnerName ?? ""}
                    scheduleId={`schedule-${reviewTarget?.id ?? ""}`}
                />
            </div>
        </AppShell>
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
