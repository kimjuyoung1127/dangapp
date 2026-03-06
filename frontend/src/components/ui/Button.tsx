"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full font-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                primary: "bg-primary text-white hover:bg-primary/90",
                secondary: "bg-muted text-foreground hover:bg-muted/80",
                outline: "border border-primary text-primary hover:bg-primary-light/20",
                ghost: "hover:bg-muted hover:text-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-12 px-6 py-3",
                sm: "h-9 px-4 text-sm",
                lg: "h-14 px-8 text-lg w-full",
                icon: "h-12 w-12",
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
