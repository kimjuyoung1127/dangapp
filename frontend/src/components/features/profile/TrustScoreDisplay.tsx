// TrustScoreDisplay.tsx — 신뢰 점수 원형 게이지 + 레벨 표시 (SKILL-08)

"use client";

import { cn } from "@/lib/utils";
import { getTrustLevelInfo, TRUST_LEVEL_CONFIG } from "@/lib/constants/reviews";

interface TrustScoreDisplayProps {
    score: number;
    level: number;
}

export default function TrustScoreDisplay({
    score,
    level,
}: TrustScoreDisplayProps) {
    const levelInfo = getTrustLevelInfo(level);
    const nextLevel = TRUST_LEVEL_CONFIG.find((c) => c.level === level + 1);
    const pointsToNext = nextLevel ? nextLevel.minScore - score : 0;

    // SVG 원형 게이지 계산
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(score / 100, 1);
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="bg-card rounded-3xl border border-border p-6">
            <h3 className="text-sm font-medium text-foreground-muted mb-4">
                신뢰 점수
            </h3>

            <div className="flex items-center gap-6">
                {/* 원형 게이지 */}
                <div className="relative w-28 h-28 flex-shrink-0">
                    <svg
                        className="w-full h-full -rotate-90"
                        viewBox="0 0 120 120"
                    >
                        {/* 배경 원 */}
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="8"
                        />
                        {/* 진행 원 */}
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="#1E88E5"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-700 ease-out"
                        />
                    </svg>
                    {/* 중앙 점수 */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-display font-bold text-foreground">
                            {score}
                        </span>
                        <span className="text-xs text-foreground-muted">
                            / 100
                        </span>
                    </div>
                </div>

                {/* 레벨 정보 */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-display font-bold text-foreground">
                            Lv.{level}
                        </span>
                        <span
                            className={cn(
                                "text-sm font-medium",
                                levelInfo.color
                            )}
                        >
                            {levelInfo.label}
                        </span>
                    </div>

                    {nextLevel && pointsToNext > 0 && (
                        <p className="text-xs text-foreground-muted">
                            다음 레벨까지 {pointsToNext}점
                        </p>
                    )}

                    {!nextLevel && (
                        <p className="text-xs text-amber-500 font-medium">
                            최고 레벨 달성!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
