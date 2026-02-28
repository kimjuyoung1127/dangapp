// StarRating.tsx — 별점 입력/표시 컴포넌트

"use client";

import { Star } from "lucide-react";
import { TapScale } from "@/components/ui/MotionWrappers";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    value: number;
    onChange?: (rating: number) => void;
    readonly?: boolean;
    size?: "sm" | "md";
}

const STARS = [1, 2, 3, 4, 5];

export default function StarRating({
    value,
    onChange,
    readonly = false,
    size = "md",
}: StarRatingProps) {
    const iconSize = size === "sm" ? "w-4 h-4" : "w-7 h-7";

    return (
        <div className="flex items-center gap-1">
            {STARS.map((star) => {
                const isFilled = star <= value;

                if (readonly) {
                    return (
                        <Star
                            key={star}
                            className={cn(
                                iconSize,
                                isFilled
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted"
                            )}
                        />
                    );
                }

                return (
                    <TapScale key={star}>
                        <button
                            type="button"
                            onClick={() => onChange?.(star)}
                            className="p-0.5"
                        >
                            <Star
                                className={cn(
                                    iconSize,
                                    "transition-colors",
                                    isFilled
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-foreground-muted/50 hover:text-amber-300"
                                )}
                            />
                        </button>
                    </TapScale>
                );
            })}
        </div>
    );
}
