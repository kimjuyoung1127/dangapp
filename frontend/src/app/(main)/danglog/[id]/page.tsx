"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Heart, Share2, Users } from "lucide-react";
import CommentSection from "@/components/features/danglog/CommentSection";
import ShareModal from "@/components/features/danglog/ShareModal";
import {
    FamilyPageIntro,
    FamilySectionTitle,
    FamilyStatusChip,
    FamilySurface,
} from "@/components/shared/FamilyUi";
import { Skeleton } from "@/components/ui/Skeleton";
import { ScrollReveal, TapScale } from "@/components/ui/MotionWrappers";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useDangLog, useDangLogCollaborators, useDangLogLikes, useToggleLike } from "@/lib/hooks/useDangLog";
import { cn } from "@/lib/utils";

const ACTIVITY_LABELS: Record<string, string> = {
    walk: "산책",
    play: "놀이",
    training: "훈련",
    cafe: "카페",
    hospital: "병원",
    other: "기타",
};

export default function DangLogDetailPage() {
    const params = useParams();
    const router = useRouter();
    const danglogId = params.id as string;

    const { data: guardian } = useCurrentGuardian();
    const guardianId = guardian?.id ?? "";
    const dogName = guardian?.dogs?.[0]?.name ?? "우리 강아지";

    const { data: danglog, isLoading } = useDangLog(danglogId);
    const { data: likes } = useDangLogLikes(danglogId);
    const { data: collaborators } = useDangLogCollaborators(danglogId);
    const toggleLike = useToggleLike();

    const [isShareOpen, setIsShareOpen] = useState(false);

    const isLiked = likes?.some((like) => like.guardian_id === guardianId) ?? false;
    const likeCount = likes?.length ?? 0;

    if (isLoading || !danglog) {
        return <DetailSkeleton onBack={() => router.back()} />;
    }

    const images = danglog.image_urls || [];
    const activityLabel = danglog.activity_type
        ? ACTIVITY_LABELS[danglog.activity_type] ?? danglog.activity_type
        : null;

    return (
        <div className="min-h-screen bg-sky-50/60 pb-24">
            <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6">
                <FamilyPageIntro
                    eyebrow="danglog detail"
                    title={danglog.title || "기록 상세"}
                    description={`${dogName}의 기록을 가족 단위 맥락으로 정리해 보세요.`}
                    backHref="/danglog"
                    action={
                        <TapScale>
                            <button
                                type="button"
                                onClick={() => setIsShareOpen(true)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-sky-700 shadow-sm"
                            >
                                <Share2 className="h-4 w-4" />
                            </button>
                        </TapScale>
                    }
                />

                {images.length > 0 ? (
                    <FamilySurface className="overflow-hidden p-0">
                        <div className="grid gap-2">
                            {images.map((url, index) => (
                                <div key={url} className="relative aspect-[4/3] bg-sky-50">
                                    <Image
                                        src={url}
                                        alt={`댕로그 사진 ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="100vw"
                                        priority={index === 0}
                                    />
                                </div>
                            ))}
                        </div>
                    </FamilySurface>
                ) : null}

                <ScrollReveal>
                    <FamilySurface className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <FamilyStatusChip label={dogName} />
                            {activityLabel ? <FamilyStatusChip label={activityLabel} tone="success" /> : null}
                            <span className="text-xs text-foreground-muted">
                                {getTimeAgo(danglog.created_at)}
                            </span>
                        </div>
                        <p className="text-base leading-7 text-foreground">{danglog.content}</p>
                    </FamilySurface>
                </ScrollReveal>

                {collaborators && collaborators.length > 0 ? (
                    <FamilySurface tone="soft" className="space-y-3">
                        <FamilySectionTitle
                            title="함께 보는 사람"
                            meta="공동 보호자와 돌봄 파트너가 같은 기록 맥락을 공유합니다."
                        />
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {collaborators.slice(0, 5).map((collaborator) => (
                                    <div
                                        key={collaborator.guardian_id}
                                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-sky-100 text-[10px] font-bold text-sky-700"
                                    >
                                        {collaborator.guardian_id.slice(0, 2).toUpperCase()}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-foreground-muted">
                                <Users className="h-4 w-4" />
                                {collaborators.length}명이 함께 보고 있어요.
                            </div>
                        </div>
                    </FamilySurface>
                ) : null}

                <FamilySurface className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <FamilySectionTitle
                            title="반응"
                            meta="좋아요와 댓글 흐름을 같은 카드 시스템 안에서 확인합니다."
                        />
                        <TapScale>
                            <button
                                type="button"
                                onClick={() =>
                                    toggleLike.mutate({
                                        danglog_id: danglogId,
                                        guardian_id: guardianId,
                                    })
                                }
                                className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700"
                            >
                                <Heart
                                    className={cn(
                                        "h-4.5 w-4.5",
                                        isLiked ? "fill-rose-500 text-rose-500" : "text-sky-700"
                                    )}
                                />
                                좋아요 {likeCount}
                            </button>
                        </TapScale>
                    </div>
                    <CommentSection danglogId={danglogId} currentGuardianId={guardianId} />
                </FamilySurface>
            </div>

            <ShareModal
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                danglogId={danglogId}
                authorId={guardianId}
            />
        </div>
    );
}

function DetailSkeleton({ onBack }: { onBack: () => void }) {
    return (
        <div className="min-h-screen bg-sky-50/60 px-4 py-6">
            <div className="mx-auto flex w-full max-w-md flex-col gap-4">
                <FamilyPageIntro
                    eyebrow="danglog detail"
                    title="기록 상세"
                    description="기록을 불러오는 중입니다."
                    action={<div className="h-10 w-10 rounded-full bg-white" />}
                />
                <FamilySurface className="overflow-hidden p-0">
                    <Skeleton className="h-72 w-full" />
                </FamilySurface>
                <FamilySurface className="space-y-3">
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={onBack}
                            className="inline-flex rounded-full bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700"
                        >
                            뒤로
                        </button>
                    </div>
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-5 w-2/3 rounded-full" />
                    <Skeleton className="h-4 w-full rounded-full" />
                    <Skeleton className="h-4 w-4/5 rounded-full" />
                </FamilySurface>
            </div>
        </div>
    );
}

function getTimeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMin < 1) return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}일 전`;
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}
