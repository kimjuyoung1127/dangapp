// ReviewCard.tsx — 후기 카드 1장 (별점 + 태그 + 텍스트 + 시간)

"use client";

import { ScrollReveal } from "@/components/ui/MotionWrappers";
import { REVIEW_TAGS } from "@/lib/constants/reviews";
import StarRating from "./StarRating";
import type { Database } from "@/types/database.types";

type Review = Database["public"]["Tables"]["reviews"]["Row"];

interface ReviewCardProps {
    review: Review;
    authorName?: string;
}

export default function ReviewCard({ review, authorName }: ReviewCardProps) {
    const timeAgo = getReviewTimeAgo(review.created_at);

    return (
        <ScrollReveal>
            <div className="bg-card rounded-3xl border border-border p-4 space-y-3">
                {/* 별점 + 작성자 */}
                <div className="flex items-center justify-between">
                    <StarRating value={review.rating} readonly size="sm" />
                    <span className="text-sm font-semibold text-foreground">
                        {authorName || review.author_id.slice(0, 6)}
                    </span>
                </div>

                {/* 태그 칩 */}
                {review.tags && review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {review.tags.map((tagId) => {
                            const tag = REVIEW_TAGS.find((t) => t.id === tagId);
                            return (
                                <span
                                    key={tagId}
                                    className="text-xs bg-primary-light/20 text-primary px-2.5 py-1 rounded-full font-medium"
                                >
                                    {tag?.label ?? tagId}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* 내용 */}
                {review.content && (
                    <p className="text-sm text-foreground">
                        {review.content}
                    </p>
                )}

                {/* 시간 */}
                <p className="text-xs text-foreground-muted text-right">
                    {timeAgo}
                </p>
            </div>
        </ScrollReveal>
    );
}

function getReviewTimeAgo(dateStr: string): string {
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
