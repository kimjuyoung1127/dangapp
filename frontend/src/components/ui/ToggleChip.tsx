// ToggleChip.tsx — CVA 기반 토글 칩 버튼 (DANG-ONB-001)

"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toggleChipVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full border font-body font-medium transition-all cursor-pointer select-none",
    {
        variants: {
            selected: {
                true: "border-primary bg-primary-light/20 text-primary",
                false: "border-border bg-card text-foreground hover:border-primary/50",
            },
            size: {
                sm: "px-3 h-9 text-sm",
                default: "px-4 h-11 text-sm",
                lg: "px-5 h-14 text-base",
            },
            fullWidth: {
                true: "w-full",
                false: "",
            },
        },
        defaultVariants: {
            selected: false,
            size: "default",
            fullWidth: false,
        },
    }
);

export interface ToggleChipProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">,
        VariantProps<typeof toggleChipVariants> {
    className?: string;
}

const ToggleChip = React.forwardRef<HTMLButtonElement, ToggleChipProps>(
    ({ className, selected, size, fullWidth, ...props }, ref) => {
        return (
            <button
                type="button"
                className={cn(toggleChipVariants({ selected, size, fullWidth, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
ToggleChip.displayName = "ToggleChip";

export { ToggleChip, toggleChipVariants };
