// danglog/[id]/page.tsx — 댕로그 상세 페이지 (실데이터 바인딩, DANG-DLG-001)

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useDangLog, useDangLogLikes, useToggleLike, useDangLogCollaborators } from "@/lib/hooks/useDangLog";
import CommentSection from "@/components/features/danglog/CommentSection";
import ShareModal from "@/components/features/danglog/ShareModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { TapScale, ScrollReveal } from "@/components/ui/MotionWrappers";
import { cn } from "@/lib/utils";
import { ArrowLeft, Heart, Share2, Users } from "lucide-react";

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

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isShareOpen, setIsShareOpen] = useState(false);

    const isLiked = likes?.some((l) => l.guardian_id === guardianId) ?? false;
    const likeCount = likes?.length ?? 0;

    if (isLoading || !danglog) {
        return <DetailSkeleton onBack={() => router.back()} />;
    }

    const images = danglog.image_urls || [];
    const activityLabel = danglog.activity_type
        ? ACTIVITY_LABELS[danglog.activity_type] ?? danglog.activity_type
        : null;

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* 상단 내비 */}
            <header className="fixed top-0 inset-x-0 z-30 bg-card/80 backdrop-blur-md border-b border-border h-14 flex items-center px-4 justify-between">
                <TapScale>
                    <button onClick={() => router.back()}>
                        <ArrowLeft className="w-6 h-6 text-foreground" />
                    </button>
                </TapScale>
                <h2 className="text-lg font-display font-semibold">댕로그</h2>
                <TapScale>
                    <button onClick={() => setIsShareOpen(true)}>
                        <Share2 className="w-5 h-5 text-foreground-muted" />
                    </button>
                </TapScale>
            </header>

            <div className="pt-14 max-w-md mx-auto">
                {/* 이미지 슬라이더 */}
                {images.length > 0 && (
                    <div className="relative">
                        <div className="overflow-x-auto snap-x snap-mandatory flex scrollbar-hide">
                            {images.map((url, idx) => (
                                <div
                                    key={idx}
                                    className="w-full flex-shrink-0 snap-center"
                                >
                                    <div className="relative aspect-[4/3] bg-muted">
                                        <Image
                                            src={url}
                                            alt={`사진 ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="100vw"
                                            priority={idx === 0}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 도트 인디케이터 */}
                        {images.length > 1 && (
                            <div className="flex justify-center gap-1.5 py-3">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={cn(
                                            "w-2 h-2 rounded-full transition-colors",
                                            idx === activeImageIndex
                                                ? "bg-primary"
                                                : "bg-muted"
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 메타 정보 */}
                <ScrollReveal>
                    <div className="px-4 py-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-semibold text-foreground">
                                {dogName}
                            </span>
                            {activityLabel && (
                                <span className="text-xs bg-primary-light/20 text-primary px-2 py-0.5 rounded-full">
                                    {activityLabel}
                                </span>
                            )}
                            <span className="text-xs text-foreground-muted ml-auto">
                                {getTimeAgo(danglog.created_at)}
                            </span>
                        </div>

                        {/* 제목 */}
                        {danglog.title && (
                            <h1 className="text-xl font-display font-bold text-foreground mb-2">
                                {danglog.title}
                            </h1>
                        )}

                        {/* 본문 */}
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                            {danglog.content}
                        </p>
                    </div>
                </ScrollReveal>

                {/* 협업자 표시 */}
                {collaborators && collaborators.length > 0 && (
                    <div className="px-4 pb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-foreground-muted" />
                        <div className="flex -space-x-2">
                            {collaborators.slice(0, 5).map((c) => (
                                <div
                                    key={c.guardian_id}
                                    className="w-6 h-6 rounded-full bg-primary-light/30 border-2 border-background flex items-center justify-center"
                                >
                                    <span className="text-[8px] font-bold text-primary">
                                        {c.guardian_id.slice(0, 2).toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <span className="text-xs text-foreground-muted">
                            {collaborators.length}명 참여 중
                        </span>
                    </div>
                )}

                {/* 좋아요 */}
                <div className="px-4 py-3 border-t border-b border-border">
                    <TapScale>
                        <button
                            onClick={() =>
                                toggleLike.mutate({
                                    danglog_id: danglogId,
                                    guardian_id: guardianId,
                                })
                            }
                            className="flex items-center gap-2"
                        >
                            <Heart
                                className={cn(
                                    "w-5 h-5 transition-colors",
                                    isLiked
                                        ? "fill-red-500 text-red-500"
                                        : "text-foreground-muted"
                                )}
                            />
                            <span
                                className={cn(
                                    "text-sm font-medium",
                                    isLiked ? "text-red-500" : "text-foreground-muted"
                                )}
                            >
                                좋아요 {likeCount}
                            </span>
                        </button>
                    </TapScale>
                </div>

                {/* 댓글 섹션 */}
                <div className="px-4 py-4">
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                        댓글
                    </h3>
                    <CommentSection
                        danglogId={danglogId}
                        currentGuardianId={guardianId}
                    />
                </div>
            </div>

            {/* 공유 모달 */}
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
        <div className="min-h-screen bg-background">
            <header className="fixed top-0 inset-x-0 z-30 bg-card/80 backdrop-blur-md border-b border-border h-14 flex items-center px-4 justify-between">
                <button onClick={onBack}>
                    <ArrowLeft className="w-6 h-6 text-foreground" />
                </button>
                <span className="text-lg font-display font-semibold">댕로그</span>
                <div className="w-6" />
            </header>
            <div className="pt-14 max-w-md mx-auto">
                <Skeleton className="h-72 w-full" />
                <div className="px-4 py-4 space-y-3">
                    <div className="flex gap-2">
                        <Skeleton className="h-4 w-16 rounded-xl" />
                        <Skeleton className="h-4 w-12 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-2/3 rounded-xl" />
                    <Skeleton className="h-4 w-full rounded-xl" />
                    <Skeleton className="h-4 w-4/5 rounded-xl" />
                </div>
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
