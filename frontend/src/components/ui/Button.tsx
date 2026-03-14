"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full font-body font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
    {
        variants: {
            variant: {
                primary: "bg-primary text-white shadow-[0_16px_30px_-18px_rgba(22,119,216,0.85)] hover:bg-primary/95 hover:shadow-[0_18px_34px_-18px_rgba(22,119,216,0.75)]",
                secondary: "bg-white text-foreground shadow-[0_14px_28px_-22px_rgba(17,49,85,0.32)] hover:bg-sky-50",
                outline: "border border-sky-200 bg-white/80 text-primary shadow-[0_10px_26px_-22px_rgba(17,49,85,0.35)] hover:bg-sky-50",
                ghost: "hover:bg-white/70 hover:text-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-12 px-6 py-3 text-[15px]",
                sm: "h-10 px-4 text-sm",
                lg: "h-14 px-8 text-lg w-full",
                icon: "h-11 w-11",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    }
);

// We extend HTMLMotionProps to allow framer-motion props
export interface ButtonProps
    extends Omit<HTMLMotionProps<"button">, "className">, // Omit to avoid clash
    VariantProps<typeof buttonVariants> {
    className?: string; // Explicitly define className
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <motion.button
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
