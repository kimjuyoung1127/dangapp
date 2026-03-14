"use client";

import { ShieldCheck } from "lucide-react";
import { ScrollReveal } from "@/components/ui/MotionWrappers";
import { cn } from "@/lib/utils";
import { getTrustLevelInfo } from "@/lib/constants/reviews";

interface ProfileHeaderProps {
    nickname: string;
    dogName?: string;
    trustLevel: number;
}

export default function ProfileHeader({
    nickname,
    dogName,
    trustLevel,
}: ProfileHeaderProps) {
    const levelInfo = getTrustLevelInfo(trustLevel);

    return (
        <ScrollReveal>
            <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(238,246,255,0.94)_52%,rgba(219,234,248,0.84)_100%)] p-6 shadow-[0_24px_60px_-34px_rgba(17,49,85,0.24)]">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] border border-white/80 bg-white/88 shadow-[0_16px_30px_-24px_rgba(17,49,85,0.3)]">
                            <span className="text-2xl font-display font-bold text-sky-700">
                                {nickname.slice(0, 1)}
                            </span>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700/90">
                                신뢰 프로필
                            </p>
                            <h2 className="mt-2 text-[1.65rem] font-display font-semibold tracking-[-0.03em] text-foreground">
                                {nickname}
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-foreground-muted">
                                {dogName ? `${dogName} 보호자로 활동 중이에요.` : "반려 정보와 신뢰도를 함께 관리하고 있어요."}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/80 bg-white/86 px-3 py-2 text-right shadow-[0_14px_28px_-22px_rgba(17,49,85,0.24)]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700/80">신뢰 레벨</p>
                        <div className="mt-1 flex items-center justify-end gap-1.5">
                            <ShieldCheck className="h-4 w-4 text-sky-700" />
                            <span className="text-sm font-semibold text-foreground">Lv.{trustLevel}</span>
                        </div>
                        <p className={cn("mt-1 text-xs font-medium", levelInfo.color)}>
                            {levelInfo.label}
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-[1.2rem] border border-white/80 bg-white/78 px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700/80">활동 상태</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">바로 연결 가능</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/80 bg-white/78 px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700/80">안심 포인트</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">프로필 정리 완료</p>
                    </div>
                </div>
            </div>
        </ScrollReveal>
    );
}
