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
            <article className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                            family memory
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                                {dogName || "우리 강아지"}
                            </span>
                            {activityLabel ? (
                                <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700">
                                    {activityLabel}
                                </span>
                            ) : null}
                        </div>
                    </div>
                    <span className="text-xs text-foreground-muted">{timeAgo}</span>
                </div>

                {firstImage ? (
                    <Link href={`/danglog/${danglog.id}`}>
                        <div className="relative aspect-[4/3] bg-sky-50">
                            <Image
                                src={firstImage}
                                alt={danglog.title || "댕로그 사진"}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 400px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                            {(danglog.image_urls?.length ?? 0) > 1 ? (
                                <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2 py-1 text-xs font-medium text-white">
                                    +{(danglog.image_urls?.length ?? 1) - 1}
                                </span>
                            ) : null}
                        </div>
                    </Link>
                ) : null}

                <div className="space-y-3 px-4 py-4">
                    {danglog.title ? (
                        <Link href={`/danglog/${danglog.id}`}>
                            <h3 className="text-lg font-semibold text-foreground">{danglog.title}</h3>
                        </Link>
                    ) : null}

                    <Link href={`/danglog/${danglog.id}`}>
                        <p className="line-clamp-3 text-sm leading-6 text-foreground-muted">
                            {danglog.content}
                        </p>
                    </Link>

                    <div className="flex items-center gap-4 border-t border-sky-100 pt-3">
                        <TapScale>
                            <button
                                type="button"
                                onClick={onToggleLike}
                                aria-label="좋아요"
                                className="inline-flex items-center gap-1.5 text-sm"
                            >
                                <Heart
                                    className={cn(
                                        "h-4.5 w-4.5 transition-colors",
                                        isLiked ? "fill-rose-500 text-rose-500" : "text-foreground-muted"
                                    )}
                                />
                                <span className={isLiked ? "font-semibold text-rose-500" : "text-foreground-muted"}>
                                    {likeCount}
                                </span>
                            </button>
                        </TapScale>

                        <Link
                            href={`/danglog/${danglog.id}`}
                            className="inline-flex items-center gap-1.5 text-sm text-foreground-muted"
                        >
                            <MessageCircle className="h-4.5 w-4.5" />
                            <span>{commentCount}</span>
                        </Link>
                    </div>
                </div>
            </article>
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
