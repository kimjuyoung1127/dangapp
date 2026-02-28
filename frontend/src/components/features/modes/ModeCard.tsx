// ModeCard.tsx — 모드 선택 카드 (잠금/해제 상태 표시)

"use client";

import { cn } from "@/lib/utils";
import { TapScale, ScrollReveal } from "@/components/ui/MotionWrappers";
import { Lock, Check } from "lucide-react";
import type { ModeConfig } from "@/lib/constants/modes";

interface ModeCardProps {
    config: ModeConfig;
    isUnlocked: boolean;
    isActive: boolean;
    currentLevel: number;
    onSelect: () => void;
}

export default function ModeCard({
    config,
    isUnlocked,
    isActive,
    currentLevel,
    onSelect,
}: ModeCardProps) {
    const Icon = config.icon;

    return (
        <ScrollReveal>
            <TapScale>
                <button
                    onClick={onSelect}
                    className={cn(
                        "w-full text-left rounded-3xl border p-5 transition-colors",
                        isActive
                            ? "bg-primary text-white border-primary"
                            : isUnlocked
                                ? "bg-card text-foreground border-border hover:border-primary-light"
                                : "bg-muted/50 text-foreground-muted border-border opacity-70"
                    )}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                                isActive
                                    ? "bg-white/20"
                                    : isUnlocked
                                        ? "bg-primary-light/20"
                                        : "bg-muted"
                            )}
                        >
                            {isUnlocked ? (
                                <Icon
                                    className={cn(
                                        "w-6 h-6",
                                        isActive ? "text-white" : "text-primary"
                                    )}
                                />
                            ) : (
                                <Lock className="w-5 h-5 text-foreground-muted" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-display font-semibold text-lg">
                                    {config.label}
                                </h3>
                                {isActive && (
                                    <span className="inline-flex items-center gap-1 bg-white/20 text-xs px-2 py-0.5 rounded-full">
                                        <Check className="w-3 h-3" />
                                        활성
                                    </span>
                                )}
                            </div>

                            <p
                                className={cn(
                                    "text-sm mb-3",
                                    isActive
                                        ? "text-white/80"
                                        : "text-foreground-muted"
                                )}
                            >
                                {config.description}
                            </p>

                            <div className="flex flex-wrap gap-1.5">
                                {config.features.map((feature) => (
                                    <span
                                        key={feature}
                                        className={cn(
                                            "text-xs px-2 py-0.5 rounded-full",
                                            isActive
                                                ? "bg-white/15 text-white/90"
                                                : isUnlocked
                                                    ? "bg-primary-light/15 text-primary"
                                                    : "bg-muted text-foreground-muted"
                                        )}
                                    >
                                        {feature}
                                    </span>
                                ))}
                            </div>

                            {!isUnlocked && (
                                <p className="text-xs mt-3 font-medium">
                                    Lv.{config.requiredLevel} 필요 (현재 Lv.{currentLevel})
                                </p>
                            )}
                        </div>
                    </div>
                </button>
            </TapScale>
        </ScrollReveal>
    );
}
