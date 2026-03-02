// page.tsx — /chat/[id] 채팅룸 페이지 (DANG-CHT-001)
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, CalendarClock, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { TapScale } from "@/components/ui/MotionWrappers";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useChatPartner } from "@/lib/hooks/useChat";
import {
    useChatRoom,
    useSendMessage,
    useMarkAsRead,
} from "@/lib/hooks/useChat";
import { ScheduleModal } from "@/components/features/chat/ScheduleModal";

export default function ChatRoomPage({
    params,
}: {
    params: { id: string };
}) {
    const router = useRouter();
    const roomId = params.id;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 현재 guardian
    const { data: guardian } = useCurrentGuardian();
    const myGuardianId = guardian?.id ?? "";

    // 메시지 로드 + Realtime
    const { messages, isLoading } = useChatRoom(roomId);
    const { mutate: sendMessage, isPending: isSending } = useSendMessage();
    const { mutate: markAsRead } = useMarkAsRead();

    const [inputText, setInputText] = useState("");
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);

    // 상대방 이름 조회
    const { data: partnerName } = useChatPartner(roomId, myGuardianId);

    // 항상 최신 메시지로 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 읽음 처리
    useEffect(() => {
        if (myGuardianId && roomId) {
            markAsRead({ roomId, guardianId: myGuardianId });
        }
    }, [myGuardianId, roomId, messages, markAsRead]);

    const handleSend = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (!inputText.trim() || isSending || !myGuardianId) return;

            sendMessage(
                {
                    room_id: roomId,
                    sender_id: myGuardianId,
                    content: inputText,
                    type: "text",
                },
                { onSuccess: () => setInputText("") }
            );
        },
        [inputText, isSending, myGuardianId, roomId, sendMessage]
    );

    const handleProposeSchedule = useCallback(
        (scheduleData: { date: string; time: string; location: string }) => {
            if (!myGuardianId) return;
            sendMessage({
                room_id: roomId,
                sender_id: myGuardianId,
                content: "새로운 산책 약속을 제안합니다!",
                type: "schedule",
                metadata: scheduleData,
            });
        },
        [myGuardianId, roomId, sendMessage]
    );

    return (
        <div className="flex flex-col h-[100dvh] bg-background">
            {/* Top App Bar */}
            <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="flex items-center gap-3">
                    <TapScale>
                        <button
                            onClick={() => router.back()}
                            className="p-1 -ml-1 text-foreground"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    </TapScale>
                    <div className="font-semibold text-foreground">
                        {partnerName ?? "채팅"}
                    </div>
                </div>

                <TapScale>
                    <button
                        onClick={() => setIsScheduleOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-light/20 text-primary rounded-full text-sm font-medium"
                    >
                        <CalendarClock className="w-4 h-4" /> 약속잡기
                    </button>
                </TapScale>
            </header>

            {/* 메시지 영역 */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                {isLoading && (
                    <div className="space-y-4">
                        <ChatMessageSkeleton isMe={false} />
                        <ChatMessageSkeleton isMe />
                        <ChatMessageSkeleton isMe={false} />
                    </div>
                )}

                {messages?.map((msg) => {
                    const isMe = msg.sender_id === myGuardianId;
                    const timeString = new Date(msg.created_at).toLocaleTimeString(
                        "ko-KR",
                        { hour: "numeric", minute: "2-digit" }
                    );

                    return (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex flex-col max-w-[75%]",
                                isMe ? "ml-auto items-end" : "mr-auto items-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "px-4 py-2.5 rounded-3xl text-[15px] leading-relaxed",
                                    isMe
                                        ? "bg-primary text-white rounded-br-sm"
                                        : "bg-card border border-border text-foreground rounded-bl-sm"
                                )}
                            >
                                {msg.type === "schedule" ? (
                                    <div className="space-y-2">
                                        <p className="font-semibold pb-1 border-b border-black/10">
                                            약속 제안
                                        </p>
                                        <div className="text-sm space-y-1">
                                            <p>
                                                {(msg.metadata as Record<string, string>)?.date}{" "}
                                                {(msg.metadata as Record<string, string>)?.time}
                                            </p>
                                            <p>
                                                {(msg.metadata as Record<string, string>)?.location}
                                            </p>
                                        </div>
                                        {!isMe && (
                                            <div className="flex gap-2 mt-3">
                                                <button className="flex-1 py-1.5 bg-black/5 text-foreground rounded-xl text-sm font-medium hover:bg-black/10 transition-colors">
                                                    거절
                                                </button>
                                                <button className="flex-1 py-1.5 bg-primary text-white rounded-xl text-sm font-medium shadow-sm hover:brightness-110 transition-all">
                                                    수락하기
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    msg.content
                                )}
                            </div>
                            <span className="text-[11px] text-foreground-muted mt-1 px-1">
                                {timeString}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </main>

            {/* 입력 영역 */}
            <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-3 pb-safe">
                <form
                    onSubmit={handleSend}
                    className="container mx-auto max-w-md flex items-center gap-2"
                >
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        className="flex-1 bg-muted rounded-full px-4 py-2.5 outline-none text-[15px] text-foreground placeholder-foreground-muted focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <TapScale>
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isSending}
                            className="p-2.5 bg-primary text-white rounded-full disabled:opacity-50 disabled:bg-muted transition-colors"
                        >
                            <Send className="w-5 h-5 ml-0.5" />
                        </button>
                    </TapScale>
                </form>
            </footer>

            {/* 약속 잡기 모달 */}
            <ScheduleModal
                isOpen={isScheduleOpen}
                onClose={() => setIsScheduleOpen(false)}
                onPropose={handleProposeSchedule}
            />
        </div>
    );
}

// 메시지 스켈레톤 (SKILL-06)
function ChatMessageSkeleton({ isMe }: { isMe: boolean }) {
    return (
        <div
            className={cn(
                "flex flex-col max-w-[75%]",
                isMe ? "ml-auto items-end" : "mr-auto items-start"
            )}
        >
            <Skeleton
                className={cn(
                    "h-10 rounded-3xl",
                    isMe ? "w-40 rounded-br-sm" : "w-52 rounded-bl-sm"
                )}
            />
            <Skeleton className="h-3 w-12 rounded-xl mt-1" />
        </div>
    );
}
