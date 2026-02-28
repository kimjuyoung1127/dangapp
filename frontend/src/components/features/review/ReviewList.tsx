// ReviewList.tsx — 후기 목록 (StaggerList + Skeleton 로딩 + 빈 상태)

"use client";

import { StaggerList, StaggerItem } from "@/components/ui/MotionWrappers";
import { Skeleton } from "@/components/ui/Skeleton";
import { useReviews } from "@/lib/hooks/useReview";
import ReviewCard from "./ReviewCard";

interface ReviewListProps {
    targetId: string;
}

export default function ReviewList({ targetId }: ReviewListProps) {
    const { data: reviews, isLoading } = useReviews(targetId);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <ReviewCardSkeleton />
                <ReviewCardSkeleton />
                <ReviewCardSkeleton />
            </div>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <p className="text-sm text-foreground-muted text-center py-8">
                아직 받은 후기가 없어요.
            </p>
        );
    }

    return (
        <StaggerList className="space-y-4">
            {reviews.map((review) => (
                <StaggerItem key={review.id}>
                    <ReviewCard review={review} />
                </StaggerItem>
            ))}
        </StaggerList>
    );
}

function ReviewCardSkeleton() {
    return (
        <div className="bg-card rounded-3xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="w-4 h-4 rounded-full" />
                    ))}
                </div>
                <Skeleton className="h-4 w-16 rounded-xl" />
            </div>
            <div className="flex gap-1.5">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-3/4 rounded-xl" />
            <Skeleton className="h-3 w-12 rounded-xl ml-auto" />
        </div>
    );
}
