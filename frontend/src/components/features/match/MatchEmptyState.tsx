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
                <div className="rounded-[1.9rem] border border-white/80 bg-white/88 px-6 py-12 text-center shadow-[0_18px_38px_-28px_rgba(17,49,85,0.22)] backdrop-blur-xl">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50">
                        <MapPin className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="mb-1 text-lg font-semibold text-foreground">
                        위치 설정이 필요해요
                    </h3>
                    <p className="mb-6 text-sm text-foreground-muted">
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
            <div className="rounded-[1.9rem] border border-white/80 bg-white/88 px-6 py-12 text-center shadow-[0_18px_38px_-28px_rgba(17,49,85,0.22)] backdrop-blur-xl">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50">
                    <Layers className="w-8 h-8 text-foreground-muted" />
                </div>
                <h3 className="mb-1 text-lg font-semibold text-foreground">
                    추천 항목이 없어요
                </h3>
                <p className="mb-6 text-sm text-foreground-muted">
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
