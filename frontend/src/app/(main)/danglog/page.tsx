"use client";

import { useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import DangLogCard from "@/components/features/danglog/DangLogCard";
import DangLogEditor from "@/components/features/danglog/DangLogEditor";
import DangLogEmptyState from "@/components/features/danglog/DangLogEmptyState";
import { AppShell } from "@/components/shared/AppShell";
import {
    FamilyPageIntro,
    FamilySectionTitle,
    FamilySurface,
} from "@/components/shared/FamilyUi";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StaggerItem, StaggerList, TapScale } from "@/components/ui/MotionWrappers";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useDangLogCounts, useDangLogLikes, useDangLogs, useToggleLike } from "@/lib/hooks/useDangLog";
import { cn } from "@/lib/utils";
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

    return (
        <AppShell>
            <div className="space-y-5 px-4 pb-28 pt-6">
                <FamilyPageIntro
                    eyebrow="danglog"
                    title="댕로그"
                    description="기억을 남기고, 함께 돌보는 사람들과 맥락을 공유하세요."
                    action={
                        <Button type="button" size="sm" onClick={() => setIsEditorOpen(true)}>
                            <Plus className="mr-1 h-4 w-4" />
                            기록하기
                        </Button>
                    }
                />

                <FamilySurface tone="soft" className="space-y-4">
                    <FamilySectionTitle
                        title="피드 보기"
                        meta="내 기록과 공유 받은 기록을 같은 카드 시스템으로 비교할 수 있습니다."
                    />
                    <div role="tablist" className="flex flex-wrap gap-2">
                        <FeedTabButton
                            active={activeTab === "mine"}
                            label="내 기록"
                            onClick={() => setActiveTab("mine")}
                        />
                        <FeedTabButton
                            active={activeTab === "shared"}
                            label="공유 받은 기록"
                            onClick={() => setActiveTab("shared")}
                        />
                    </div>
                </FamilySurface>

                {isLoading ? (
                    <div className="space-y-4">
                        <DangLogCardSkeleton />
                        <DangLogCardSkeleton />
                    </div>
                ) : !danglogs || danglogs.length === 0 ? (
                    <FamilySurface tone="soft">
                        <DangLogEmptyState onCreateClick={() => setIsEditorOpen(true)} />
                    </FamilySurface>
                ) : (
                    <StaggerList className="space-y-4">
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

            <TapScale className="fixed bottom-24 right-6 z-20">
                <button
                    type="button"
                    onClick={() => setIsEditorOpen(true)}
                    aria-label="댕로그 작성"
                    className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg shadow-sky-200"
                    )}
                >
                    <BookOpen className="h-5 w-5" />
                </button>
            </TapScale>

            {guardianId ? (
                <DangLogEditor
                    isOpen={isEditorOpen}
                    onClose={() => setIsEditorOpen(false)}
                    authorId={guardianId}
                    dogId={guardian?.dogs?.[0]?.id}
                />
            ) : null}
        </AppShell>
    );
}

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
    const isLiked = likes?.some((like) => like.guardian_id === guardianId) ?? false;

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

function FeedTabButton({
    active,
    label,
    onClick,
}: {
    active: boolean;
    label: string;
    onClick: () => void;
}) {
    return (
        <Button type="button" variant={active ? "primary" : "ghost"} size="sm" onClick={onClick}>
            {label}
        </Button>
    );
}

function DangLogCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-20 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-14 rounded-full" />
            </div>
            <Skeleton className="h-56 w-full" />
            <div className="space-y-2 px-4 py-4">
                <Skeleton className="h-5 w-2/3 rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-4/5 rounded-full" />
            </div>
        </div>
    );
}
