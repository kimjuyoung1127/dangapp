"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, CalendarClock, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { TapScale } from "@/components/ui/MotionWrappers";
import { useChatRoom, useSendMessage } from "@/lib/hooks/useChat";
import { ScheduleModal } from "@/components/features/chat/ScheduleModal";

export default function ChatRoomPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const roomId = params.id;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, isLoading } = useChatRoom(roomId);
    const { mutate: sendMessage, isPending: isSending } = useSendMessage();

    // TODO: 전역 스토어 구현 완료 시 내 아이디 연동
    const myGuardianId = "my-guardian-id";
    const [inputText, setInputText] = useState("");
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);

    // 항상 최신 메시지로 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || isSending) return;

        sendMessage(
            { room_id: roomId, sender_id: myGuardianId, content: inputText, type: 'text' },
            {
                onSuccess: () => setInputText("")
            }
        );
    };

    const openScheduleModal = () => {
        setIsScheduleOpen(true);
    };

    const handleProposeSchedule = (scheduleData: { date: string; time: string; location: string }) => {
        sendMessage({
            room_id: roomId,
            sender_id: myGuardianId,
            content: "새로운 산책 약속을 제안합니다!",
            type: 'schedule',
            metadata: scheduleData
        });
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-background">
            {/* 챗룸 커스텀 Top App Bar */}
            <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="flex items-center gap-3">
                    <TapScale>
                        <button onClick={() => router.back()} className="p-1 -ml-1 text-foreground">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    </TapScale>
                    <div className="font-semibold text-foreground">초코언니</div>
                </div>

                <TapScale>
                    <button
                        onClick={openScheduleModal}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-light/20 text-primary rounded-full text-sm font-medium"
                    >
                        <CalendarClock className="w-4 h-4" /> 약속잡기
                    </button>
                </TapScale>
            </header>

            {/* 메시지 영역 */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                {isLoading && <div className="text-center text-sm text-foreground-muted mt-4">메시지를 불러오는 중...</div>}

                {messages?.map((msg) => {
                    const isMe = msg.sender_id === myGuardianId;
                    const timeString = new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });

                    return (
                        <div
                            key={msg.id}
                            className={`flex flex-col max-w-[75%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                        >
                            <div
                                className={`px-4 py-2.5 rounded-3xl text-[15px] leading-relaxed
                                    ${isMe
                                        ? 'bg-primary text-white rounded-br-sm'
                                        : 'bg-card border border-border text-foreground rounded-bl-sm'}
                                `}
                            >
                                {msg.type === 'schedule' ? (
                                    <div className="space-y-2">
                                        <p className="font-semibold pb-1 border-b border-black/10">약속 제안 🐾</p>
                                        <div className="text-sm space-y-1">
                                            <p>📅 {msg.metadata?.date} {msg.metadata?.time}</p>
                                            <p>📍 {msg.metadata?.location}</p>
                                        </div>
                                        {!isMe && (
                                            <div className="flex gap-2 mt-3">
                                                <button className="flex-1 py-1.5 bg-black/5 text-foreground rounded-lg text-sm font-medium hover:bg-black/10 transition-colors">
                                                    거절
                                                </button>
                                                <button className="flex-1 py-1.5 bg-primary text-white rounded-lg text-sm font-medium shadow-sm hover:brightness-110 transition-all">
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
                {/* 스크롤 하단 타겟 */}
                <div ref={messagesEndRef} />
            </main>

            {/* 입력 영역 (키보드 대응 safe-area 고려) */}
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

            {/* 약속 잡기 바텀 시트 */}
            <ScheduleModal
                isOpen={isScheduleOpen}
                onClose={() => setIsScheduleOpen(false)}
                onPropose={handleProposeSchedule}
            />
        </div>
    );
}
