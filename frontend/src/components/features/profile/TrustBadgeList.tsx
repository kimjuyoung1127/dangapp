// TrustBadgeList.tsx — 뱃지 목록 (가로 스크롤, 잠금/해제 상태)

"use client";

import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/MotionWrappers";
import { BADGE_CONFIG } from "@/lib/constants/reviews";
import { Lock } from "lucide-react";
import type { Database } from "@/types/database.types";

type TrustBadge = Database["public"]["Tables"]["trust_badges"]["Row"];

interface TrustBadgeListProps {
    earnedBadges: TrustBadge[];
}

export default function TrustBadgeList({ earnedBadges }: TrustBadgeListProps) {
    const earnedTypes = new Set(earnedBadges.map((b) => b.badge_type));

    return (
        <ScrollReveal>
            <div className="bg-card rounded-3xl border border-border p-5">
                <h3 className="text-sm font-medium text-foreground-muted mb-4">
                    뱃지
                </h3>

                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                    {BADGE_CONFIG.map((badge) => {
                        const isEarned = earnedTypes.has(badge.type);
                        const Icon = badge.icon;

                        return (
                            <div
                                key={badge.type}
                                className={cn(
                                    "flex flex-col items-center gap-2 min-w-[72px] p-3 rounded-xl border",
                                    isEarned
                                        ? "border-primary bg-primary-light/10"
                                        : "border-border bg-muted/40 opacity-40"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center",
                                        isEarned
                                            ? "bg-primary text-white"
                                            : "bg-muted text-foreground-muted"
                                    )}
                                >
                                    {isEarned ? (
                                        <Icon className="w-5 h-5" />
                                    ) : (
                                        <Lock className="w-4 h-4" />
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "text-[11px] font-medium text-center leading-tight",
                                        isEarned
                                            ? "text-foreground"
                                            : "text-foreground-muted"
                                    )}
                                >
                                    {badge.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </ScrollReveal>
    );
}
