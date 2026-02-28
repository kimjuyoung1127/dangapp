// ModeUnlockDialog.tsx — 잠금 해제 조건 안내 BottomSheet

"use client";

import { BottomSheet } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
import { Lock, ShieldCheck } from "lucide-react";
import type { ModeConfig } from "@/lib/constants/modes";

interface ModeUnlockDialogProps {
    isOpen: boolean;
    onClose: () => void;
    config: ModeConfig;
    currentLevel: number;
    currentScore: number;
}

export default function ModeUnlockDialog({
    isOpen,
    onClose,
    config,
    currentLevel,
    currentScore,
}: ModeUnlockDialogProps) {
    const levelGap = config.requiredLevel - currentLevel;

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose}>
            <div className="p-6 space-y-6 text-center">
                {/* 잠금 아이콘 */}
                <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center">
                    <Lock className="w-8 h-8 text-foreground-muted" />
                </div>

                {/* 모드 정보 */}
                <div className="space-y-2">
                    <h3 className="text-xl font-display font-bold text-foreground">
                        {config.label}
                    </h3>
                    <p className="text-sm text-foreground-muted">
                        {config.description}
                    </p>
                </div>

                {/* 해제 조건 */}
                <div className="bg-muted/50 rounded-3xl p-5 space-y-3 text-left">
                    <p className="text-sm font-medium text-foreground">
                        해제 조건
                    </p>

                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                신뢰 레벨 Lv.{config.requiredLevel} 이상
                            </p>
                            <p className="text-xs text-foreground-muted">
                                현재 Lv.{currentLevel} · 점수 {currentScore}/100
                            </p>
                        </div>
                    </div>

                    {levelGap > 0 && (
                        <p className="text-xs text-foreground-muted">
                            {levelGap}단계 더 올려야 합니다. 약속 완료, 후기 받기로 점수를 올려보세요!
                        </p>
                    )}
                </div>

                {/* 기능 미리보기 */}
                <div className="space-y-2 text-left">
                    <p className="text-sm font-medium text-foreground">
                        해제 시 사용 가능 기능
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {config.features.map((feature) => (
                            <span
                                key={feature}
                                className="text-xs bg-primary-light/15 text-primary px-3 py-1.5 rounded-full font-medium"
                            >
                                {feature}
                            </span>
                        ))}
                    </div>
                </div>

                <Button size="lg" className="w-full" onClick={onClose}>
                    확인
                </Button>
            </div>
        </BottomSheet>
    );
}
