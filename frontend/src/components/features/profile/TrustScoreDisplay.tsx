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

    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(score / 100, 1);
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="rounded-[1.9rem] border border-white/80 bg-white/88 p-5 shadow-[0_18px_38px_-28px_rgba(17,49,85,0.22)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700/90">
                        신뢰 점수
                    </p>
                    <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-foreground">
                        지금 쌓인 안심 지표
                    </h3>
                </div>
                <div className="rounded-[1.1rem] border border-white/80 bg-sky-50/80 px-3 py-2 text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700/80">현재 레벨</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">Lv.{level}</p>
                </div>
            </div>

            <div className="mt-5 flex items-center gap-5">
                <div className="relative h-28 w-28 flex-shrink-0">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="#D9E9F7"
                            strokeWidth="8"
                        />
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-display font-bold text-foreground">
                            {score}
                        </span>
                        <span className="text-xs text-foreground-muted">
                            / 100
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-display font-bold text-foreground">
                            Lv.{level}
                        </span>
                        <span className={cn("text-sm font-medium", levelInfo.color)}>
                            {levelInfo.label}
                        </span>
                    </div>

                    {nextLevel && pointsToNext > 0 ? (
                        <p className="text-sm leading-6 text-foreground-muted">
                            다음 레벨까지 <span className="font-semibold text-foreground">{pointsToNext}점</span> 남았어요.
                        </p>
                    ) : (
                        <p className="text-sm font-medium text-amber-600">
                            최고 레벨 달성!
                        </p>
                    )}

                    <p className="text-xs leading-5 text-foreground-muted">
                        후기, 일정 완료, 프로필 완성도가 차곡차곡 반영돼요.
                    </p>
                </div>
            </div>
        </div>
    );
}
