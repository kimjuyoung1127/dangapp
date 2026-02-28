// ReviewTagSelect.tsx — 후기 태그 칩 멀티선택

"use client";

import { TapScale } from "@/components/ui/MotionWrappers";
import { cn } from "@/lib/utils";
import { REVIEW_TAGS, type ReviewTagId } from "@/lib/constants/reviews";

interface ReviewTagSelectProps {
    selected: ReviewTagId[];
    onChange: (tags: ReviewTagId[]) => void;
}

export default function ReviewTagSelect({
    selected,
    onChange,
}: ReviewTagSelectProps) {
    const toggleTag = (tagId: ReviewTagId) => {
        if (selected.includes(tagId)) {
            onChange(selected.filter((t) => t !== tagId));
        } else {
            onChange([...selected, tagId]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {REVIEW_TAGS.map((tag) => {
                const isSelected = selected.includes(tag.id);

                return (
                    <TapScale key={tag.id}>
                        <button
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className={cn(
                                "px-3.5 py-2 rounded-full text-sm font-medium border transition-colors",
                                isSelected
                                    ? "bg-primary text-white border-primary"
                                    : "bg-card text-foreground-muted border-border hover:border-primary-light"
                            )}
                        >
                            {tag.label}
                        </button>
                    </TapScale>
                );
            })}
        </div>
    );
}
