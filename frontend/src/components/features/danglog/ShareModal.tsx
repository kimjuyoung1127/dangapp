// ShareModal.tsx — 댕로그 공유 모달 (협업 초대 + 소셜 공유, DANG-DLG-001)

"use client";

import { useState } from "react";
import { BottomSheet, TapScale } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useInviteCollaborator } from "@/lib/hooks/useDangLog";
import { X, Link2, Share2, Copy, Check } from "lucide-react";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    danglogId: string;
    authorId: string;
}

export default function ShareModal({
    isOpen,
    onClose,
    danglogId,
    authorId,
}: ShareModalProps) {
    const [copied, setCopied] = useState(false);
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const inviteMutation = useInviteCollaborator();

    const handleCreateInviteLink = async () => {
        const invite = await inviteMutation.mutateAsync({
            danglog_id: danglogId,
            invited_by: authorId,
        });
        const link = `${window.location.origin}/danglog/invite/${invite.invite_token}`;
        setInviteLink(link);
    };

    const handleCopyLink = async () => {
        const link = inviteLink ?? `${window.location.origin}/danglog/${danglogId}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
        }
    };

    const handleNativeShare = async () => {
        const url = `${window.location.origin}/danglog/${danglogId}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "댕로그 공유",
                    text: "댕로그를 확인해보세요!",
                    url,
                });
            } catch {
                // 사용자가 취소
            }
        } else {
            handleCopyLink();
        }
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose}>
            <div className="p-6 space-y-6">
                {/* 상단 바 */}
                <div className="flex items-center justify-between">
                    <button type="button" onClick={onClose}>
                        <X className="w-6 h-6 text-foreground-muted" />
                    </button>
                    <h3 className="text-xl font-display font-semibold">공유하기</h3>
                    <div className="w-6" />
                </div>

                {/* 섹션 1: 협업자 초대 */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">
                        협업자 초대
                    </h4>
                    <p className="text-xs text-foreground-muted">
                        초대 링크를 통해 다른 보호자와 함께 댕로그를 작성할 수 있어요.
                    </p>

                    {inviteLink ? (
                        <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-3 border border-border">
                            <Link2 className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-xs text-foreground truncate flex-1">
                                {inviteLink}
                            </span>
                            <TapScale>
                                <button onClick={handleCopyLink}>
                                    {copied ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-foreground-muted" />
                                    )}
                                </button>
                            </TapScale>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCreateInviteLink}
                            disabled={inviteMutation.isPending}
                        >
                            <Link2 className="w-4 h-4 mr-1.5" />
                            {inviteMutation.isPending ? "생성 중..." : "초대 링크 만들기"}
                        </Button>
                    )}
                </div>

                {/* 구분선 */}
                <div className="border-t border-border" />

                {/* 섹션 2: 소셜 공유 */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">
                        소셜 공유
                    </h4>
                    <div className="flex gap-3">
                        <TapScale>
                            <button
                                onClick={handleNativeShare}
                                className={cn(
                                    "flex flex-col items-center gap-1.5 p-3 rounded-xl",
                                    "bg-muted/50 border border-border hover:bg-muted transition-colors"
                                )}
                            >
                                <Share2 className="w-5 h-5 text-primary" />
                                <span className="text-[11px] text-foreground-muted">공유</span>
                            </button>
                        </TapScale>
                        <TapScale>
                            <button
                                onClick={handleCopyLink}
                                className={cn(
                                    "flex flex-col items-center gap-1.5 p-3 rounded-xl",
                                    "bg-muted/50 border border-border hover:bg-muted transition-colors"
                                )}
                            >
                                {copied ? (
                                    <Check className="w-5 h-5 text-green-500" />
                                ) : (
                                    <Copy className="w-5 h-5 text-primary" />
                                )}
                                <span className="text-[11px] text-foreground-muted">
                                    {copied ? "복사됨" : "링크 복사"}
                                </span>
                            </button>
                        </TapScale>
                    </div>
                </div>
            </div>
        </BottomSheet>
    );
}
