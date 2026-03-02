// danglog/page.tsx — 댕로그 피드 페이지 (실데이터 바인딩, DANG-DLG-001)

"use client";

import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { StaggerList, StaggerItem, TapScale } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useDangLogs, useToggleLike, useDangLogCounts, useDangLogLikes } from "@/lib/hooks/useDangLog";
import DangLogCard from "@/components/features/danglog/DangLogCard";
import DangLogEditor from "@/components/features/danglog/DangLogEditor";
import DangLogEmptyState from "@/components/features/danglog/DangLogEmptyState";
import { cn } from "@/lib/utils";
import { BookOpen, Plus } from "lucide-react";
import type { Database } from "@/types/database.types";

type FeedTab = "mine" | "shared";
type DangLog = Database["public"]["Tables"]["danglogs"]["Row"];

export default function DangLogFeedPage() {
    const [activeTab, setActiveTab] = useState<FeedTab>("mine");
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const { data: guardian, isLoading: guardianLoading } = useCurrentGuardian();
    const guardianId = guardian?.id;
    const dogName = guardian?.dogs?.[0]?.name;

    const { data: danglogs, isLoading: danglogsLoading } = useDangLogs(
        activeTab === "mine" ? guardianId : undefined
    );

    const toggleLike = useToggleLike();

    const isLoading = guardianLoading || danglogsLoading;

    const TABS: { value: FeedTab; label: string }[] = [
        { value: "mine", label: "내 기록" },
        { value: "shared", label: "공유받은" },
    ];

    return (
        <AppShell>
            <div className="w-full max-w-md mx-auto px-4 pb-24">
                {/* 페이지 헤더 */}
                <h2 className="text-2xl font-display font-semibold mb-4 flex items-center gap-2">
                    댕로그 <BookOpen className="w-5 h-5 text-primary" />
                </h2>

                {/* 탭 */}
                <div role="tablist" className="flex gap-2 mb-6">
                    {TABS.map((tab) => (
                        <Button
                            key={tab.value}
                            role="tab"
                            aria-selected={activeTab === tab.value}
                            variant={activeTab === tab.value ? "primary" : "ghost"}
                            size="sm"
                            onClick={() => setActiveTab(tab.value)}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>

                {/* 피드 */}
                {isLoading ? (
                    <div className="space-y-6">
                        <DangLogCardSkeleton />
                        <DangLogCardSkeleton />
                    </div>
                ) : !danglogs || danglogs.length === 0 ? (
                    <DangLogEmptyState onCreateClick={() => setIsEditorOpen(true)} />
                ) : (
                    <StaggerList className="space-y-6">
                        {danglogs.map((log) => (
                            <StaggerItem key={log.id}>
                                <DangLogCardWithCounts
                                    danglog={log}
                                    guardianId={guardianId ?? ""}
                                    dogName={dogName}
                                    onToggleLike={() => {
                                        if (guardianId) {
                                            toggleLike.mutate({
                                                danglog_id: log.id,
                                                guardian_id: guardianId,
                                            });
                                        }
                                    }}
                                />
                            </StaggerItem>
                        ))}
                    </StaggerList>
                )}
            </div>

            {/* FAB (새 댕로그 작성) */}
            <TapScale className="fixed bottom-24 right-6 z-20">
                <button
                    onClick={() => setIsEditorOpen(true)}
                    aria-label="새 댕로그 작성"
                    className={cn(
                        "w-14 h-14 rounded-full bg-primary text-white",
                        "flex items-center justify-center shadow-lg shadow-primary/30",
                        "hover:bg-primary/90 transition-colors"
                    )}
                >
                    <Plus className="w-6 h-6" />
                </button>
            </TapScale>

            {/* 작성 에디터 */}
            {guardianId && (
                <DangLogEditor
                    isOpen={isEditorOpen}
                    onClose={() => setIsEditorOpen(false)}
                    authorId={guardianId}
                    dogId={guardian?.dogs?.[0]?.id}
                />
            )}
        </AppShell>
    );
}

/** 개별 카드 + 좋아요/댓글 카운트 쿼리 래퍼 */
function DangLogCardWithCounts({
    danglog,
    guardianId,
    dogName,
    onToggleLike,
}: {
    danglog: DangLog;
    guardianId: string;
    dogName?: string;
    onToggleLike: () => void;
}) {
    const { data: counts } = useDangLogCounts(danglog.id);
    const { data: likes } = useDangLogLikes(danglog.id);
    const isLiked = likes?.some((l) => l.guardian_id === guardianId) ?? false;

    return (
        <DangLogCard
            danglog={danglog}
            likeCount={counts?.likeCount ?? 0}
            commentCount={counts?.commentCount ?? 0}
            isLiked={isLiked}
            onToggleLike={onToggleLike}
            dogName={dogName}
        />
    );
}

function DangLogCardSkeleton() {
    return (
        <div className="bg-card rounded-3xl border border-border/50 overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                <Skeleton className="h-4 w-16 rounded-xl" />
                <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <Skeleton className="h-56 w-full" />
            <div className="px-4 py-3 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-xl" />
                <Skeleton className="h-3 w-full rounded-xl" />
            </div>
            <div className="px-4 pb-4 flex gap-4">
                <Skeleton className="h-4 w-10 rounded-xl" />
                <Skeleton className="h-4 w-10 rounded-xl" />
            </div>
        </div>
    );
}
