"use client";

import { motion, AnimatePresence } from "framer-motion";

export const TapScale = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <motion.div
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={className}
    >
        {children}
    </motion.div>
);

export const StaggerList = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <motion.div
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        initial="hidden"
        animate="show"
        className={className}
    >
        {children}
    </motion.div>
);

export const StaggerItem = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <motion.div
        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
        className={className}
    >
        {children}
    </motion.div>
);

export const ScrollReveal = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={className}
        style={style}
    >
        {children}
    </motion.div>
);

interface BottomSheetProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
}

export const BottomSheet = ({ children, isOpen, onClose }: BottomSheetProps) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div
                    className="fixed inset-0 bg-black/40 z-40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                />
                <motion.div
                    className="fixed inset-x-0 bottom-0 bg-card rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                    {children}
                </motion.div>
            </>
        )}
    </AnimatePresence>
);
