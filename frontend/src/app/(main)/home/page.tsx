"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shared/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { TapScale } from "@/components/ui/MotionWrappers";
import MatchCard from "@/components/features/match/MatchCard";
import { Layers } from "lucide-react";

export default function HomePage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 임시 로딩 시뮬레이션
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleLikeSection = (sectionId: string) => {
        console.log("Liked section:", sectionId);
        // TODO: DB에 Like 기록 (matches 테이블)
    };

    const handlePass = () => {
        console.log("Passed guardian");
        // TODO: 다음 사람으로 넘어가기 로직
    };

    return (
        <AppShell>
            <div className="w-full max-w-md mx-auto px-4">
                {/* 모드 선택 진입점 */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-display font-semibold">추천 친구</h2>
                    <TapScale>
                        <Link
                            href="/modes"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-light/20 text-primary text-sm font-medium"
                        >
                            <Layers className="w-4 h-4" />
                            모드
                        </Link>
                    </TapScale>
                </div>

                {isLoading ? (
                    <div className="space-y-6">
                        <MatchCardSkeleton />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <MatchCard
                            guardian={null}
                            dog={null}
                            onLikeSection={handleLikeSection}
                            onPass={handlePass}
                        />

                        {/* 예시: 데이터가 없을 때의 빈 상태 (조건부 렌더링 가정) */}
                        {/* 
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Layers className="w-8 h-8 text-foreground-muted" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">추천 항목이 없어요</h3>
                            <p className="text-sm text-foreground-muted">다른 모드를 선택하거나 잠시 후 다시 시도해보세요.</p>
                        </div> 
                        */}
                    </div>
                )}
            </div>
        </AppShell>
    );
}

// 스켈레톤 팩토리 패턴 (SKILL-06 적용)
function MatchCardSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-4 border border-border rounded-3xl bg-card">
            {/* 둥근 헤더 (이름 + 뱃지) */}
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="w-24 h-5 rounded-xl" />
            </div>

            {/* 대형 사진 영역 */}
            <Skeleton className="w-full aspect-[4/5] rounded-3xl" />

            {/* 텍스트 줄 */}
            <div className="space-y-2">
                <Skeleton className="w-3/4 h-4 rounded-xl" />
                <Skeleton className="w-1/2 h-4 rounded-xl" />
            </div>

            {/* 특성 칩 */}
            <div className="flex gap-2">
                <Skeleton className="w-16 h-8 rounded-full" />
                <Skeleton className="w-20 h-8 rounded-full" />
                <Skeleton className="w-14 h-8 rounded-full" />
            </div>
        </div>
    );
}
