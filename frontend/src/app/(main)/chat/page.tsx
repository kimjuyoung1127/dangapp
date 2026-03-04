// page.tsx — /chat 채팅 목록 페이지 (DANG-CHT-001)
"use client";

import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/shared/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { ScrollReveal, TapScale } from "@/components/ui/MotionWrappers";
import ChatEmptyState from "@/components/features/chat/ChatEmptyState";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useChatRooms } from "@/lib/hooks/useChat";
import { MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

function formatLastTime(dateStr: string | null): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString("ko-KR", {
            hour: "numeric",
            minute: "2-digit",
        });
    }
    if (diffDays === 1) return "어제";
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

function getLastMessagePreview(
    content: string | null,
    type: string
): string {
    if (type === "schedule") return "약속 제안";
    if (type === "image") return "사진";
    if (type === "system") return "시스템 메시지";
    return content || "";
}

export default function ChatListPage() {
    const { data: guardian, isLoading: guardianLoading } = useCurrentGuardian();
    const guardianId = guardian?.id ?? "";

    const { data: rooms = [], isLoading: roomsLoading } =
        useChatRooms(guardianId);

    const isLoading = guardianLoading || (!!guardianId && roomsLoading);

    return (
        <AppShell>
            <div className="w-full max-w-md mx-auto px-4 pb-24">
                <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2">
                    채팅 <MessageSquareText className="w-5 h-5 text-primary" />
                </h2>

                {isLoading ? (
                    <div className="space-y-4">
                        <ChatListSkeleton />
                        <ChatListSkeleton />
                        <ChatListSkeleton />
                    </div>
                ) : rooms.length === 0 ? (
                    <ChatEmptyState />
                ) : (
                    <div className="space-y-3">
                        {rooms.map((room, idx) => {
                            const partnerImg =
                                room.partner.avatar_url ||
                                room.partner.dogs[0]?.photo_urls?.[0] ||
                                "/placeholder-dog.svg";

                            return (
                                <ScrollReveal
                                    key={room.id}
                                    style={{ transitionDelay: `${idx * 80}ms` }}
                                >
                                    <Link href={`/chat/${room.id}`}>
                                        <TapScale className="block p-3 rounded-3xl hover:bg-muted transition-colors border border-transparent hover:border-border cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-14 h-14 flex-shrink-0">
                                                    <Image
                                                        src={partnerImg}
                                                        alt={room.partner.nickname}
                                                        fill
                                                        className="object-cover rounded-full"
                                                    />
                                                    {room.unreadCount > 0 && (
                                                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                                                            {room.unreadCount > 9
                                                                ? "9+"
                                                                : room.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h3 className="font-semibold text-foreground truncate">
                                                            {room.partner.nickname}
                                                        </h3>
                                                        <span className="text-xs text-foreground-muted flex-shrink-0 ml-2">
                                                            {formatLastTime(
                                                                room.last_message_at
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p
                                                        className={cn(
                                                            "text-sm truncate",
                                                            room.unreadCount > 0
                                                                ? "text-foreground font-medium"
                                                                : "text-foreground-muted"
                                                        )}
                                                    >
                                                        {getLastMessagePreview(
                                                            room.lastMessage,
                                                            room.lastMessageType
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </TapScale>
                                    </Link>
                                </ScrollReveal>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppShell>
    );
}

// 스켈레톤 팩토리 패턴 (SKILL-06)
function ChatListSkeleton() {
    return (
        <div className="flex items-center gap-4 p-3 bg-card rounded-3xl border border-border/50">
            <Skeleton className="w-14 h-14 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3 rounded-xl" />
                <Skeleton className="h-3 w-3/4 rounded-xl" />
            </div>
        </div>
    );
}
