"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { ScrollReveal, TapScale } from "@/components/ui/MotionWrappers";
import Image from "next/image";
import Link from "next/link";
import { MessageSquareText } from "lucide-react";

export default function ChatListPage() {
    const [isLoading, setIsLoading] = useState(true);

    // 더미 데이터
    const mockChats = [
        {
            id: "rm-1",
            partnerName: "초코언니",
            partnerImg: "/photo/2025040803041_0.jpg",
            lastMessage: "이번 주말 언제가 좋으신가요?",
            lastTime: "오후 2:30",
            unreadCount: 1,
        },
        {
            id: "rm-2",
            partnerName: "바둑이오빠",
            partnerImg: "/photo/62f9a36ea3cea.jpg",
            lastMessage: "안녕하세요! 매칭 감사합니다 😊",
            lastTime: "어제",
            unreadCount: 0,
        }
    ];

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

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
                ) : (
                    <div className="space-y-3">
                        {mockChats.length === 0 ? (
                            <div className="text-center text-foreground-muted mt-20">
                                <p className="font-medium text-lg text-foreground">아직 진행 중인 대화가 없어요.</p>
                                <p className="mt-2 text-sm">탐색 탭에서 마음이 맞는 보호자를 찾아보세요!</p>
                            </div>
                        ) : (
                            mockChats.map((chat, idx) => (
                                <ScrollReveal key={chat.id} style={{ transitionDelay: `${idx * 100}ms` }}>
                                    <Link href={`/chat/${chat.id}`}>
                                        <TapScale className="block p-3 rounded-3xl hover:bg-muted transition-colors border border-transparent hover:border-border cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-14 h-14 flex-shrink-0">
                                                    <Image
                                                        src={chat.partnerImg}
                                                        alt={chat.partnerName}
                                                        fill
                                                        className="object-cover rounded-full"
                                                    />
                                                    {chat.unreadCount > 0 && (
                                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                                                            {chat.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h3 className="font-semibold text-foreground truncate">{chat.partnerName}</h3>
                                                        <span className="text-xs text-foreground-muted flex-shrink-0 ml-2">{chat.lastTime}</span>
                                                    </div>
                                                    <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'text-foreground font-medium' : 'text-foreground-muted'}`}>
                                                        {chat.lastMessage}
                                                    </p>
                                                </div>
                                            </div>
                                        </TapScale>
                                    </Link>
                                </ScrollReveal>
                            ))
                        )}
                    </div>
                )}
            </div>
        </AppShell>
    );
}

// 스켈레톤 팩토리 패턴 (SKILL-06 적용)
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
