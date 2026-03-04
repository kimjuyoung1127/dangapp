// MatchEmptyState.tsx — 추천 프로필 없을 때 빈 상태 (DANG-MAT-001)
"use client";

import Link from "next/link";
import { Layers, MapPin } from "lucide-react";
import { ScrollReveal } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";

interface MatchEmptyStateProps {
    reason?: "no-location" | "no-results";
}

export default function MatchEmptyState({ reason = "no-results" }: MatchEmptyStateProps) {
    if (reason === "no-location") {
        return (
            <ScrollReveal>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-primary-light/20 rounded-full flex items-center justify-center mb-4">
                        <MapPin className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                        위치 설정이 필요해요
                    </h3>
                    <p className="text-sm text-foreground-muted mb-6">
                        내 동네를 설정하면 주변 보호자를 추천받을 수 있어요.
                    </p>
                    <Link href="/profile">
                        <Button variant="primary" size="sm">
                            프로필에서 위치 설정
                        </Button>
                    </Link>
                </div>
            </ScrollReveal>
        );
    }

    return (
        <ScrollReveal>
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Layers className="w-8 h-8 text-foreground-muted" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                    추천 항목이 없어요
                </h3>
                <p className="text-sm text-foreground-muted mb-6">
                    다른 모드를 선택하거나 잠시 후 다시 시도해보세요.
                </p>
                <Link href="/modes">
                    <Button variant="outline" size="sm">
                        모드 변경하기
                    </Button>
                </Link>
            </div>
        </ScrollReveal>
    );
}
