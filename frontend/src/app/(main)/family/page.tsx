// family/page.tsx — 패밀리 그룹 목록 페이지

"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { TapScale, StaggerList, StaggerItem } from "@/components/ui/MotionWrappers";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FamilyGroupCard from "@/components/features/family/FamilyGroupCard";
import FamilyGroupForm from "@/components/features/family/FamilyGroupForm";
import type { Database } from "@/types/database.types";

type FamilyGroup = Database["public"]["Tables"]["family_groups"]["Row"];

// 더미 데이터
const MOCK_GROUPS: FamilyGroup[] = [
    {
        id: "fg-1",
        name: "초코네 가족",
        creator_id: "mock-user",
        dog_ids: ["dog-1", "dog-2"],
        created_at: "2026-02-20T00:00:00Z",
    },
];

const MOCK_MEMBER_COUNTS: Record<string, number> = {
    "fg-1": 3,
};

export default function FamilyPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 임시 로딩 시뮬레이션
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AppShell>
            <div className="px-4 py-6 space-y-6">
                {/* 헤더 */}
                <div className="flex items-center gap-3">
                    <Link href="/modes">
                        <ArrowLeft className="w-5 h-5 text-foreground-muted" />
                    </Link>
                    <h1 className="text-2xl font-display font-bold text-foreground">
                        패밀리 모드
                    </h1>
                </div>

                {/* 그룹 목록 */}
                {isLoading ? (
                    <div className="space-y-4">
                        <FamilyGroupSkeleton />
                        <FamilyGroupSkeleton />
                    </div>
                ) : MOCK_GROUPS.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                        <p className="text-foreground-muted text-sm">
                            아직 패밀리 그룹이 없어요.
                        </p>
                        <TapScale>
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="text-primary font-medium text-sm"
                            >
                                첫 그룹 만들기
                            </button>
                        </TapScale>
                    </div>
                ) : (
                    <StaggerList className="space-y-4">
                        {MOCK_GROUPS.map((group) => (
                            <StaggerItem key={group.id}>
                                <FamilyGroupCard
                                    group={group}
                                    memberCount={MOCK_MEMBER_COUNTS[group.id] ?? 0}
                                />
                            </StaggerItem>
                        ))}
                    </StaggerList>
                )}
            </div>

            {/* FAB */}
            <TapScale className="fixed bottom-24 right-6 z-20">
                <button
                    onClick={() => setIsFormOpen(true)}
                    aria-label="새 패밀리 그룹 생성"
                    className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-lg"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </TapScale>

            {/* 그룹 생성 폼 */}
            <FamilyGroupForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                creatorId="mock-user"
            />
        </AppShell>
    );
}

function FamilyGroupSkeleton() {
    return (
        <div className="bg-card rounded-3xl border border-border p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32 rounded-xl" />
                    <Skeleton className="h-4 w-20 rounded-xl" />
                </div>
            </div>
            <Skeleton className="w-8 h-8 rounded-full" />
        </div>
    );
}
