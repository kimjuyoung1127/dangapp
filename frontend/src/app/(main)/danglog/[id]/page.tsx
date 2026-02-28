"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useDangLog, useDangLogLikes, useToggleLike } from "@/lib/hooks/useDangLog";
import CommentSection from "@/components/features/danglog/CommentSection";
import { Skeleton } from "@/components/ui/Skeleton";
import { TapScale, ScrollReveal } from "@/components/ui/MotionWrappers";
import { cn } from "@/lib/utils";
import { ArrowLeft, Heart } from "lucide-react";

const ACTIVITY_LABELS: Record<string, string> = {
    walk: "산책",
    play: "놀이",
    training: "훈련",
    cafe: "카페",
    hospital: "병원",
    other: "기타",
};

// 임시 사용자 ID
const MOCK_GUARDIAN_ID = "mock-guardian-001";

export default function DangLogDetailPage() {
    const params = useParams();
    const router = useRouter();
    const danglogId = params.id as string;

    const { data: danglog, isLoading } = useDangLog(danglogId);
    const { data: likes } = useDangLogLikes(danglogId);
    const toggleLike = useToggleLike();

    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const isLiked = likes?.some((l) => l.guardian_id === MOCK_GUARDIAN_ID) ?? false;
    const likeCount = likes?.length ?? 0;

    // 더미 데이터 (Supabase 연동 전)
    const mockDangLog = danglog || {
        id: danglogId,
        author_id: MOCK_GUARDIAN_ID,
        dog_id: "dog-1",
        title: "한강 산책 일기",
        content:
            "한강공원에서 1시간 동안 프리스비 놀이를 했어요. 초코가 정말 신나게 뛰어다녔답니다! 날씨도 좋고 바람도 시원해서 우리 둘 다 기분이 너무 좋았어요.",
        image_urls: [
            "/photo/2025040803041_0.jpg",
            "/photo/jYcIZ1753511586.jpg",
        ],
        activity_type: "walk",
        shared_with: null,
        co_authors: null,
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
    };

    const images = mockDangLog.image_urls || [];
    const activityLabel = mockDangLog.activity_type
        ? ACTIVITY_LABELS[mockDangLog.activity_type] ?? mockDangLog.activity_type
        : null;

    if (isLoading) {
        return <DetailSkeleton onBack={() => router.back()} />;
    }

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
                <div className="w-6" />
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
                                            onLoad={() => {
                                                // 현재 보이는 이미지 인덱스 업데이트
                                            }}
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
                                초코
                            </span>
                            {activityLabel && (
                                <span className="text-xs bg-primary-light/20 text-primary px-2 py-0.5 rounded-full">
                                    {activityLabel}
                                </span>
                            )}
                            <span className="text-xs text-foreground-muted ml-auto">
                                {getTimeAgo(mockDangLog.created_at)}
                            </span>
                        </div>

                        {/* 제목 */}
                        {mockDangLog.title && (
                            <h1 className="text-xl font-display font-bold text-foreground mb-2">
                                {mockDangLog.title}
                            </h1>
                        )}

                        {/* 본문 */}
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                            {mockDangLog.content}
                        </p>
                    </div>
                </ScrollReveal>

                {/* 좋아요 */}
                <div className="px-4 py-3 border-t border-b border-border">
                    <TapScale>
                        <button
                            onClick={() =>
                                toggleLike.mutate({
                                    danglog_id: danglogId,
                                    guardian_id: MOCK_GUARDIAN_ID,
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
                        currentGuardianId={MOCK_GUARDIAN_ID}
                    />
                </div>
            </div>
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
