// File: Chat list page styled with the family organizer direction.
"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import { FamilyEmptyPanel, FamilyPageIntro, FamilySectionTitle, FamilyStatusChip, FamilySurface } from "@/components/shared/FamilyUi";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { ScrollReveal, TapScale } from "@/components/ui/MotionWrappers";
import ChatEmptyState from "@/components/features/chat/ChatEmptyState";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useChatRooms } from "@/lib/hooks/useChat";
import { cn } from "@/lib/utils";

function formatLastTime(dateStr: string | null): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
    }
    if (diffDays === 1) return "어제";
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

function getLastMessagePreview(content: string | null, type: string): string {
    if (type === "schedule") return "일정 제안";
    if (type === "image") return "사진";
    if (type === "system") return "시스템 메시지";
    return content || "";
}

export default function ChatListPage() {
    const { data: guardian, isLoading: guardianLoading } = useCurrentGuardian();
    const guardianId = guardian?.id ?? "";

    const { data: rooms = [], isLoading: roomsLoading, error: roomsError, refetch: refetchRooms } = useChatRooms(guardianId);

    const isLoading = guardianLoading || (!!guardianId && roomsLoading);
    const unreadCount = rooms.reduce((sum, room) => sum + room.unreadCount, 0);

    return (
        <AppShell>
            <div className="mx-auto w-full max-w-md space-y-5 px-4 pb-24 pt-3">
                <FamilyPageIntro
                    eyebrow="대화함"
                    title="채팅"
                    description="읽지 않은 대화와 일정 제안을 한 눈에 정리해서 보여줍니다."
                    action={<div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/84 px-3 py-2 text-sm font-medium text-sky-700 shadow-[0_14px_28px_-22px_rgba(17,49,85,0.32)]"><MessageSquareText className="h-4 w-4" /> {unreadCount}</div>}
                />

                <FamilySurface tone="soft" className="overflow-hidden">
                    <FamilySectionTitle title="대화 정리" meta="최근 액션, 읽지 않음, 일정 제안 여부를 우선해서 보여줍니다." />
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-[1.2rem] border border-white/80 bg-white/78 px-3 py-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700/80">읽지 않음</p>
                            <p className="mt-1 text-sm font-semibold text-foreground">{unreadCount}건</p>
                        </div>
                        <div className="rounded-[1.2rem] border border-white/80 bg-white/78 px-3 py-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700/80">대화 수</p>
                            <p className="mt-1 text-sm font-semibold text-foreground">{rooms.length}개</p>
                        </div>
                        <div className="rounded-[1.2rem] border border-white/80 bg-white/78 px-3 py-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700/80">상태</p>
                            <p className="mt-1 text-sm font-semibold text-foreground">즉시 확인</p>
                        </div>
                    </div>
                </FamilySurface>

                {isLoading ? (
                    <div className="space-y-4">
                        <ChatListSkeleton />
                        <ChatListSkeleton />
                        <ChatListSkeleton />
                    </div>
                ) : roomsError ? (
                    <FamilyEmptyPanel
                        message="채팅 목록을 불러오지 못했어요. 다시 시도해서 최신 대화를 확인해 주세요."
                        action={<Button size="sm" variant="outline" onClick={() => refetchRooms()}>다시 시도</Button>}
                    />
                ) : rooms.length === 0 ? (
                    <ChatEmptyState />
                ) : (
                    <div className="space-y-3">
                        {rooms.map((room, idx) => {
                            const partnerImg = room.partner.avatar_url || room.partner.dogs[0]?.photo_urls?.[0] || "/placeholder-dog.svg";
                            const hasScheduleSignal = room.lastMessageType === "schedule";

                            return (
                                <ScrollReveal key={room.id} style={{ transitionDelay: `${idx * 70}ms` }}>
                                    <Link href={`/chat/${room.id}`}>
                                        <TapScale className="block">
                                            <FamilySurface className="p-3.5 transition-colors hover:border-sky-200 hover:bg-sky-50/40">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="relative h-14 w-14 shrink-0">
                                                        <Image src={partnerImg} alt={room.partner.nickname} fill className="rounded-[1.3rem] object-cover" />
                                                        {room.unreadCount > 0 ? (
                                                            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-sky-600 px-1 text-[10px] font-bold text-white">
                                                                {room.unreadCount > 9 ? "9+" : room.unreadCount}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-2 flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <h3 className="truncate text-[15px] font-semibold tracking-[-0.02em] text-foreground">{room.partner.nickname}</h3>
                                                                <div className="mt-1 flex flex-wrap gap-2">
                                                                    {room.unreadCount > 0 ? <FamilyStatusChip label="읽지 않음" /> : null}
                                                                    {hasScheduleSignal ? <FamilyStatusChip label="일정 제안" tone="success" /> : null}
                                                                </div>
                                                            </div>
                                                            <span className="shrink-0 text-xs text-foreground-muted">{formatLastTime(room.last_message_at)}</span>
                                                        </div>
                                                        <p className={cn("truncate text-[13px]", room.unreadCount > 0 ? "font-medium text-foreground" : "text-foreground-muted")}>
                                                            {getLastMessagePreview(room.lastMessage, room.lastMessageType)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </FamilySurface>
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

function ChatListSkeleton() {
    return (
        <FamilySurface className="p-3">
            <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3 rounded-xl" />
                    <Skeleton className="h-4 w-2/3 rounded-xl" />
                </div>
            </div>
        </FamilySurface>
    );
}
