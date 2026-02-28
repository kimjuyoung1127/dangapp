"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { ScrollReveal, TapScale } from "@/components/ui/MotionWrappers";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type DangLog = Database["public"]["Tables"]["danglogs"]["Row"];

const ACTIVITY_LABELS: Record<string, string> = {
    walk: "산책",
    play: "놀이",
    training: "훈련",
    cafe: "카페",
    hospital: "병원",
    other: "기타",
};

interface DangLogCardProps {
    danglog: DangLog;
    likeCount: number;
    commentCount: number;
    isLiked: boolean;
    onToggleLike: () => void;
    dogName?: string;
}

export default function DangLogCard({
    danglog,
    likeCount,
    commentCount,
    isLiked,
    onToggleLike,
    dogName,
}: DangLogCardProps) {
    const timeAgo = getTimeAgo(danglog.created_at);
    const activityLabel = danglog.activity_type
        ? ACTIVITY_LABELS[danglog.activity_type] ?? danglog.activity_type
        : null;
    const firstImage = danglog.image_urls?.[0];

    return (
        <ScrollReveal>
            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                {/* 헤더: 강아지 이름 + 활동유형 */}
                <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                        {dogName || "우리 강아지"}
                    </span>
                    {activityLabel && (
                        <span className="text-xs bg-primary-light/20 text-primary px-2 py-0.5 rounded-full">
                            {activityLabel}
                        </span>
                    )}
                </div>

                {/* 이미지 (있을 경우) */}
                {firstImage && (
                    <Link href={`/danglog/${danglog.id}`}>
                        <div className="relative aspect-[4/3] bg-muted">
                            <Image
                                src={firstImage}
                                alt={danglog.title || "댕로그 사진"}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 400px"
                            />
                            {(danglog.image_urls?.length ?? 0) > 1 && (
                                <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                                    +{(danglog.image_urls?.length ?? 1) - 1}
                                </span>
                            )}
                        </div>
                    </Link>
                )}

                {/* 본문 */}
                <div className="px-4 py-3">
                    {danglog.title && (
                        <Link href={`/danglog/${danglog.id}`}>
                            <h3 className="font-display font-semibold text-foreground mb-1 line-clamp-1">
                                {danglog.title}
                            </h3>
                        </Link>
                    )}
                    <Link href={`/danglog/${danglog.id}`}>
                        <p className="text-sm text-foreground line-clamp-2">
                            {danglog.content}
                        </p>
                    </Link>
                </div>

                {/* 하단: 좋아요 + 댓글 + 시간 */}
                <div className="px-4 pb-4 flex items-center gap-4">
                    <TapScale>
                        <button
                            onClick={onToggleLike}
                            aria-label="좋아요"
                            className="flex items-center gap-1 text-sm"
                        >
                            <Heart
                                className={cn(
                                    "w-4.5 h-4.5 transition-colors",
                                    isLiked
                                        ? "fill-red-500 text-red-500"
                                        : "text-foreground-muted"
                                )}
                            />
                            <span
                                className={cn(
                                    isLiked
                                        ? "text-red-500 font-medium"
                                        : "text-foreground-muted"
                                )}
                            >
                                {likeCount}
                            </span>
                        </button>
                    </TapScale>

                    <Link
                        href={`/danglog/${danglog.id}`}
                        className="flex items-center gap-1 text-sm text-foreground-muted"
                    >
                        <MessageCircle className="w-4.5 h-4.5" />
                        <span>{commentCount}</span>
                    </Link>

                    <span className="text-xs text-foreground-muted ml-auto">
                        {timeAgo}
                    </span>
                </div>
            </div>
        </ScrollReveal>
    );
}

function getTimeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}일 전`;
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}
