"use client";

import { ScrollReveal } from "@/components/ui/MotionWrappers";

interface ProfileStatsProps {
    reviewCount: number;
    avgRating: number;
    completedSchedules: number;
}

export default function ProfileStats({
    reviewCount,
    avgRating,
    completedSchedules,
}: ProfileStatsProps) {
    const stats = [
        { label: "후기 수", value: reviewCount.toString(), hint: "남긴 평가" },
        { label: "평균 평점", value: avgRating > 0 ? avgRating.toFixed(1) : "-", hint: "최근 신뢰도" },
        { label: "완료 일정", value: completedSchedules.toString(), hint: "함께한 산책" },
    ];

    return (
        <ScrollReveal>
            <div className="grid grid-cols-3 gap-3">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-[1.35rem] border border-white/80 bg-white/78 p-4 text-center"
                    >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700/80">
                            {stat.label}
                        </p>
                        <p className="mt-2 text-2xl font-display font-bold text-foreground">
                            {stat.value}
                        </p>
                        <p className="mt-1 text-xs text-foreground-muted">
                            {stat.hint}
                        </p>
                    </div>
                ))}
            </div>
        </ScrollReveal>
    );
}
