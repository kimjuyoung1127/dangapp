// ProfileHeader.tsx — 프로필 상단 (아바타 + 이름 + 신뢰 레벨 + 뱃지)

"use client";

import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/MotionWrappers";
import { ShieldCheck } from "lucide-react";
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
            <div className="bg-card rounded-3xl border border-border p-6 flex flex-col items-center gap-3">
                {/* 아바타 */}
                <div className="w-20 h-20 rounded-full bg-primary-light/30 flex items-center justify-center">
                    <span className="text-2xl font-display font-bold text-primary">
                        {nickname.slice(0, 1)}
                    </span>
                </div>

                {/* 이름 + 반려견 */}
                <div className="text-center">
                    <h2 className="text-xl font-display font-bold text-foreground">
                        {nickname}
                    </h2>
                    {dogName && (
                        <p className="text-sm text-foreground-muted mt-0.5">
                            {dogName} 보호자
                        </p>
                    )}
                </div>

                {/* 신뢰 레벨 인라인 뱃지 */}
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-primary text-white text-xs px-2.5 py-1 rounded-full font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Lv.{trustLevel}
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
            </div>
        </ScrollReveal>
    );
}
