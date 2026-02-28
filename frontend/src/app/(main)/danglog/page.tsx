"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { StaggerList, StaggerItem, TapScale } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
import { useDangLogs, useToggleLike } from "@/lib/hooks/useDangLog";
import DangLogCard from "@/components/features/danglog/DangLogCard";
import DangLogEditor from "@/components/features/danglog/DangLogEditor";
import { cn } from "@/lib/utils";
import { BookOpen, Plus } from "lucide-react";

type FeedTab = "mine" | "shared";

// 임시 사용자 ID (추후 useAuth 훅으로 교체)
const MOCK_GUARDIAN_ID = "mock-guardian-001";

export default function DangLogFeedPage() {
    const [activeTab, setActiveTab] = useState<FeedTab>("mine");
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const { data: danglogs, isLoading } = useDangLogs(
        activeTab === "mine" ? MOCK_GUARDIAN_ID : undefined
    );

    const toggleLike = useToggleLike();

    // 초기 로딩 시뮬레이션
    useEffect(() => {
        const timer = setTimeout(() => setIsInitialLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const showLoading = isLoading || isInitialLoading;

    // 더미 데이터 (Supabase 연동 전 시각적 확인용)
    const mockDangLogs = danglogs && danglogs.length > 0
        ? danglogs
        : [
            {
                id: "dl-1",
                author_id: MOCK_GUARDIAN_ID,
                dog_id: "dog-1",
                title: "한강 산책 일기",
                content: "한강공원에서 1시간 동안 프리스비 놀이를 했어요. 초코가 정말 신나게 뛰어다녔답니다!",
                image_urls: ["/photo/2025040803041_0.jpg"],
                activity_type: "walk",
                shared_with: null,
                co_authors: null,
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: "dl-2",
                author_id: MOCK_GUARDIAN_ID,
                dog_id: "dog-1",
                title: null,
                content: "오늘은 새로운 간식을 사줬는데 너무 좋아하더라구요. 꼬리를 미친듯이 흔들면서 두발로 섰어요!",
                image_urls: null,
                activity_type: "play",
                shared_with: null,
                co_authors: null,
                created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date().toISOString(),
            },
        ];

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
                {showLoading ? (
                    <div className="space-y-6">
                        <DangLogCardSkeleton />
                        <DangLogCardSkeleton />
                    </div>
                ) : mockDangLogs.length === 0 ? (
                    <div className="text-center mt-20">
                        <p className="font-medium text-lg text-foreground">
                            아직 기록이 없어요.
                        </p>
                        <p className="mt-2 text-sm text-foreground-muted">
                            첫 댕로그를 작성해보세요!
                        </p>
                        <Button
                            className="mt-4"
                            onClick={() => setIsEditorOpen(true)}
                        >
                            댕로그 작성하기
                        </Button>
                    </div>
                ) : (
                    <StaggerList className="space-y-6">
                        {mockDangLogs.map((log) => (
                            <StaggerItem key={log.id}>
                                <DangLogCard
                                    danglog={log}
                                    likeCount={3}
                                    commentCount={2}
                                    isLiked={false}
                                    onToggleLike={() =>
                                        toggleLike.mutate({
                                            danglog_id: log.id,
                                            guardian_id: MOCK_GUARDIAN_ID,
                                        })
                                    }
                                    dogName="초코"
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
            <DangLogEditor
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                authorId={MOCK_GUARDIAN_ID}
                dogId="dog-1"
            />
        </AppShell>
    );
}

// 스켈레톤 팩토리 (SKILL-06)
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
