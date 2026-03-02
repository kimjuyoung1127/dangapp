// MutualMatchModal.tsx — 상호 매칭 축하 모달 (DANG-MAT-001)
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MutualMatchModalProps {
    isOpen: boolean;
    partnerName: string;
    dogName: string;
    onChat: () => void;
    onClose: () => void;
}

export default function MutualMatchModal({
    isOpen,
    partnerName,
    dogName,
    onChat,
    onClose,
}: MutualMatchModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center px-6"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        <div className="bg-card rounded-3xl p-8 w-full max-w-sm text-center shadow-xl">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-8 h-8 text-primary fill-primary" />
                            </div>

                            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                                매칭 성공!
                            </h2>
                            <p className="text-foreground-muted text-sm mb-6">
                                {partnerName}님과 {dogName}도 당신을 좋아해요!
                            </p>

                            <div className="flex flex-col gap-3">
                                <Button onClick={onChat} size="lg">
                                    채팅하기
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                >
                                    나중에
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
