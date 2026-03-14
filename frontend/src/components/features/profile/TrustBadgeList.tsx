"use client";

import { Lock } from "lucide-react";
import { ScrollReveal } from "@/components/ui/MotionWrappers";
import { BADGE_CONFIG } from "@/lib/constants/reviews";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type TrustBadge = Database["public"]["Tables"]["trust_badges"]["Row"];

interface TrustBadgeListProps {
    earnedBadges: TrustBadge[];
}

export default function TrustBadgeList({ earnedBadges }: TrustBadgeListProps) {
    const earnedTypes = new Set(earnedBadges.map((badge) => badge.badge_type));

    return (
        <ScrollReveal>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {BADGE_CONFIG.map((badge) => {
                    const isEarned = earnedTypes.has(badge.type);
                    const Icon = badge.icon;

                    return (
                        <div
                            key={badge.type}
                            className={cn(
                                "min-w-[140px] rounded-[1.35rem] border p-4",
                                isEarned
                                    ? "border-sky-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(235,245,255,0.88)_100%)]"
                                    : "border-slate-200/80 bg-slate-50/75"
                            )}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div
                                    className={cn(
                                        "flex h-11 w-11 items-center justify-center rounded-full",
                                        isEarned
                                            ? "bg-sky-600 text-white"
                                            : "bg-slate-200 text-slate-500"
                                    )}
                                >
                                    {isEarned ? <Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                                </div>
                                <span
                                    className={cn(
                                        "rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em]",
                                        isEarned
                                            ? "border-sky-200 bg-white text-sky-700"
                                            : "border-slate-200 bg-white/70 text-slate-500"
                                    )}
                                >
                                    {isEarned ? "획득" : "준비 중"}
                                </span>
                            </div>

                            <p className={cn("mt-4 text-sm font-semibold", isEarned ? "text-foreground" : "text-slate-600")}>
                                {badge.label}
                            </p>
                            <p className={cn("mt-1 text-xs leading-5", isEarned ? "text-foreground-muted" : "text-slate-500")}>
                                {badge.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </ScrollReveal>
    );
}
