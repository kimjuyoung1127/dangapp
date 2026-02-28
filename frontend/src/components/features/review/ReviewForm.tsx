// ReviewForm.tsx — 후기 작성 BottomSheet (별점 + 태그 + 한줄평)

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BottomSheet } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useCreateReview } from "@/lib/hooks/useReview";
import { type ReviewTagId } from "@/lib/constants/reviews";
import StarRating from "./StarRating";
import ReviewTagSelect from "./ReviewTagSelect";
import { X } from "lucide-react";

const reviewSchema = z.object({
    content: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
    isOpen: boolean;
    onClose: () => void;
    authorId: string;
    targetId: string;
    targetName: string;
    scheduleId?: string;
}

export default function ReviewForm({
    isOpen,
    onClose,
    authorId,
    targetId,
    targetName,
    scheduleId,
}: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState<ReviewTagId[]>([]);

    const createReview = useCreateReview();

    const {
        register,
        handleSubmit,
        reset,
    } = useForm<ReviewFormData>({
        resolver: zodResolver(reviewSchema),
    });

    const onSubmit = async (formData: ReviewFormData) => {
        if (rating === 0) return;

        await createReview.mutateAsync({
            author_id: authorId,
            target_id: targetId,
            schedule_id: scheduleId ?? null,
            rating,
            content: formData.content || null,
            tags: selectedTags.length > 0 ? selectedTags : null,
        });

        // 초기화 + 닫기
        reset();
        setRating(0);
        setSelectedTags([]);
        onClose();
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* 상단 바 */}
                <div className="flex items-center justify-between">
                    <button type="button" onClick={onClose}>
                        <X className="w-6 h-6 text-foreground-muted" />
                    </button>
                    <h3 className="text-xl font-display font-semibold">
                        후기 작성
                    </h3>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={rating === 0 || createReview.isPending}
                    >
                        {createReview.isPending ? "저장 중..." : "완료"}
                    </Button>
                </div>

                {/* 대상자 안내 */}
                <div className="text-center space-y-1">
                    <p className="text-lg font-display font-semibold text-foreground">
                        {targetName} 님과의 만남은
                    </p>
                    <p className="text-lg font-display font-semibold text-foreground">
                        어떠셨나요?
                    </p>
                </div>

                {/* 별점 */}
                <div className="flex justify-center">
                    <StarRating value={rating} onChange={setRating} />
                </div>

                {/* 태그 선택 */}
                <div>
                    <label className="text-sm font-medium text-foreground-muted mb-2 block">
                        태그 선택 (복수 가능)
                    </label>
                    <ReviewTagSelect
                        selected={selectedTags}
                        onChange={setSelectedTags}
                    />
                </div>

                {/* 한줄평 */}
                <input
                    {...register("content")}
                    placeholder="한줄평 (선택)"
                    className={cn(
                        "w-full px-4 py-3 rounded-xl border border-border bg-card",
                        "text-foreground placeholder:text-foreground-muted/50",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    )}
                />
            </form>
        </BottomSheet>
    );
}
