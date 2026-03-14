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
                        <div className="w-full max-w-sm rounded-[2rem] border border-white/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.97)_0%,rgba(238,246,255,0.94)_56%,rgba(219,234,248,0.88)_100%)] p-8 text-center shadow-[0_32px_80px_-36px_rgba(17,49,85,0.4)]">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
                                <Heart className="h-8 w-8 fill-sky-600 text-sky-600" />
                            </div>

                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700/90">
                                연결 완료
                            </p>
                            <h2 className="mb-2 mt-2 text-2xl font-display font-bold text-foreground">
                                서로 관심이 이어졌어요
                            </h2>
                            <p className="mb-6 text-sm leading-6 text-foreground-muted">
                                {partnerName}님과 {dogName}도 같은 마음을 보냈어요. 지금 바로 대화를 열어 산책 일정을 이어가 보세요.
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
