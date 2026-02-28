// ProfileStats.tsx — 통계 카드 (후기 수, 평균 별점, 완료 약속 수)

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
        { label: "후기", value: reviewCount.toString() },
        { label: "평균", value: avgRating > 0 ? avgRating.toFixed(1) : "-" },
        { label: "약속", value: completedSchedules.toString() },
    ];

    return (
        <ScrollReveal>
            <div className="grid grid-cols-3 gap-3">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-card rounded-3xl border border-border p-4 text-center"
                    >
                        <p className="text-2xl font-display font-bold text-foreground">
                            {stat.value}
                        </p>
                        <p className="text-xs text-foreground-muted mt-1">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>
        </ScrollReveal>
    );
}
