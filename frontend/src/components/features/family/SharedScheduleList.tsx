// SharedScheduleList.tsx — 공동 일정 리스트 (기존 스케줄 재사용)

"use client";

import { StaggerList, StaggerItem } from "@/components/ui/MotionWrappers";
import { Skeleton } from "@/components/ui/Skeleton";
import { Calendar, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface SharedSchedule {
    id: string;
    title: string;
    datetime: string;
    location_name: string | null;
    status: "proposed" | "confirmed" | "completed" | "cancelled";
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    proposed: { label: "제안됨", color: "text-amber-500 bg-amber-50" },
    confirmed: { label: "확정", color: "text-green-600 bg-green-50" },
    completed: { label: "완료", color: "text-primary bg-primary-light/20" },
    cancelled: { label: "취소", color: "text-foreground-muted bg-muted" },
};

interface SharedScheduleListProps {
    schedules: SharedSchedule[];
    isLoading: boolean;
}

export default function SharedScheduleList({
    schedules,
    isLoading,
}: SharedScheduleListProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                <ScheduleSkeleton />
                <ScheduleSkeleton />
            </div>
        );
    }

    if (schedules.length === 0) {
        return (
            <p className="text-sm text-foreground-muted text-center py-6">
                공동 일정이 없어요.
            </p>
        );
    }

    return (
        <StaggerList className="space-y-3">
            {schedules.map((schedule) => {
                const statusInfo = STATUS_LABELS[schedule.status];
                return (
                    <StaggerItem key={schedule.id}>
                        <div className="bg-card rounded-3xl border border-border p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm text-foreground">
                                    {schedule.title}
                                </h4>
                                <span
                                    className={cn(
                                        "text-xs font-medium px-2 py-0.5 rounded-full",
                                        statusInfo.color
                                    )}
                                >
                                    {statusInfo.label}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-foreground-muted">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>
                                        {new Date(schedule.datetime).toLocaleDateString("ko-KR", {
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>
                                        {new Date(schedule.datetime).toLocaleTimeString("ko-KR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                                {schedule.location_name && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span className="truncate max-w-[120px]">
                                            {schedule.location_name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </StaggerItem>
                );
            })}
        </StaggerList>
    );
}

function ScheduleSkeleton() {
    return (
        <div className="bg-card rounded-3xl border border-border p-4 space-y-2">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32 rounded-xl" />
                <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="flex gap-3">
                <Skeleton className="h-3 w-16 rounded-xl" />
                <Skeleton className="h-3 w-12 rounded-xl" />
            </div>
        </div>
    );
}
