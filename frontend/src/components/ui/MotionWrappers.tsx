"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

export const TapScale = ({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) => {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const StaggerList = ({
    children,
    className,
    animateOnMount = false,
}: {
    children: ReactNode;
    className?: string;
    animateOnMount?: boolean;
}) => {
    const reduceMotion = useReducedMotion();
    const shouldAnimate = animateOnMount && !reduceMotion;

    return (
        <motion.div
            variants={{
                show: {
                    transition: {
                        staggerChildren: 0.04,
                    },
                },
            }}
            initial={shouldAnimate ? "hidden" : undefined}
            animate={shouldAnimate ? "show" : undefined}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const StaggerItem = ({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) => {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            variants={{
                hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 8 },
                show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const ScrollReveal = ({
    children,
    className,
    style,
}: {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
}) => {
    const reduceMotion = useReducedMotion();

    if (reduceMotion) {
        return (
            <div className={className} style={style}>
                {children}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-16px" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
};

export const PageSlide = ({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) => {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, x: 8 }}
            animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

interface BottomSheetProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
}

export const BottomSheet = ({ children, isOpen, onClose }: BottomSheetProps) => (
    <BottomSheetInner isOpen={isOpen} onClose={onClose}>
        {children}
    </BottomSheetInner>
);

function BottomSheetInner({
    children,
    isOpen,
    onClose,
}: BottomSheetProps) {
    const reduceMotion = useReducedMotion();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/40 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.16 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="fixed inset-x-0 bottom-0 bg-card rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto"
                        initial={reduceMotion ? undefined : { y: "100%" }}
                        animate={reduceMotion ? undefined : { y: 0 }}
                        exit={reduceMotion ? undefined : { y: "100%" }}
                        transition={{ type: "spring", damping: 32, stiffness: 380 }}
                    >
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
