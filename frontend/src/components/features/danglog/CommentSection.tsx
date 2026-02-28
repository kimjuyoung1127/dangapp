"use client";

import { useState } from "react";
import { StaggerList, StaggerItem, TapScale } from "@/components/ui/MotionWrappers";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useDangLogComments, useCreateComment } from "@/lib/hooks/useDangLog";
import { Send } from "lucide-react";

interface CommentSectionProps {
    danglogId: string;
    currentGuardianId: string;
}

export default function CommentSection({
    danglogId,
    currentGuardianId,
}: CommentSectionProps) {
    const { data: comments, isLoading } = useDangLogComments(danglogId);
    const createComment = useCreateComment();
    const [newComment, setNewComment] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        await createComment.mutateAsync({
            danglog_id: danglogId,
            author_id: currentGuardianId,
            content: newComment.trim(),
        });

        setNewComment("");
    };

    return (
        <div className="space-y-4">
            {/* 댓글 목록 */}
            {isLoading ? (
                <div className="space-y-3">
                    <CommentSkeleton />
                    <CommentSkeleton />
                </div>
            ) : comments && comments.length > 0 ? (
                <StaggerList className="space-y-3">
                    {comments.map((comment) => (
                        <StaggerItem key={comment.id}>
                            <div className="flex gap-3">
                                {/* 아바타 자리 */}
                                <div className="w-8 h-8 rounded-full bg-primary-light/30 flex-shrink-0 flex items-center justify-center">
                                    <span className="text-xs font-display font-bold text-primary">
                                        {comment.author_id.slice(0, 2).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-semibold text-foreground">
                                            {comment.author_id.slice(0, 6)}
                                        </span>
                                        <span className="text-xs text-foreground-muted">
                                            {getCommentTimeAgo(comment.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground mt-0.5">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerList>
            ) : (
                <p className="text-sm text-foreground-muted text-center py-4">
                    아직 댓글이 없어요. 첫 댓글을 남겨보세요!
                </p>
            )}

            {/* 댓글 입력 */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    className={cn(
                        "flex-1 px-4 py-2.5 rounded-xl border border-border bg-card",
                        "text-sm text-foreground placeholder:text-foreground-muted/50",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    )}
                />
                <TapScale>
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!newComment.trim() || createComment.isPending}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </TapScale>
            </form>
        </div>
    );
}

function CommentSkeleton() {
    return (
        <div className="flex gap-3">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-24 rounded-xl" />
                <Skeleton className="h-3 w-3/4 rounded-xl" />
            </div>
        </div>
    );
}

function getCommentTimeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMin < 1) return "방금";
    if (diffMin < 60) return `${diffMin}분`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay}일`;
}
