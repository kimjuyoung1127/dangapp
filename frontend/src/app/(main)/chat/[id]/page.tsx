// File: Chat room page with realtime messaging and schedule proposal creation.
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarClock, ChevronLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { ScheduleModal } from "@/components/features/chat/ScheduleModal";
import { TapScale } from "@/components/ui/MotionWrappers";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useChatPartner, useChatRoom, useMarkAsRead, useSendMessage } from "@/lib/hooks/useChat";
import { useCreateSchedule, useRespondSchedule } from "@/lib/hooks/useSchedule";
import { cn } from "@/lib/utils";

export default function ChatRoomPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const roomId = params.id;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: guardian } = useCurrentGuardian();
    const myGuardianId = guardian?.id ?? "";

    const { messages, isLoading, error: messagesError } = useChatRoom(roomId);
    const { mutate: sendMessage, mutateAsync: sendMessageAsync, isPending: isSending } = useSendMessage();
    const { mutate: markAsRead } = useMarkAsRead();
    const { mutateAsync: createScheduleAsync, isPending: isCreatingSchedule } = useCreateSchedule();
    const { mutate: respondSchedule, isPending: isRespondingSchedule } = useRespondSchedule();

    const [inputText, setInputText] = useState("");
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);

    const { data: partner } = useChatPartner(roomId, myGuardianId);

    const scheduleResponseById = useMemo(() => {
        const map = new Map<string, "accepted" | "rejected">();

        for (const message of messages ?? []) {
            if (message.type !== "system") continue;
            const metadata = (message.metadata as Record<string, unknown>) || {};
            const scheduleId =
                typeof metadata.scheduleId === "string" ? metadata.scheduleId : null;
            if (!scheduleId) continue;

            if (metadata.proposalStatus === "accepted") map.set(scheduleId, "accepted");
            if (metadata.proposalStatus === "rejected") map.set(scheduleId, "rejected");
            if (metadata.status === "confirmed") map.set(scheduleId, "accepted");
            if (metadata.status === "cancelled") map.set(scheduleId, "rejected");
        }

        return map;
    }, [messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (myGuardianId && roomId) {
            markAsRead({ roomId, guardianId: myGuardianId });
        }
    }, [markAsRead, messages, myGuardianId, roomId]);

    const handleSend = useCallback(
        (event: React.FormEvent) => {
            event.preventDefault();
            if (!inputText.trim() || isSending || !myGuardianId) return;

            sendMessage(
                {
                    room_id: roomId,
                    sender_id: myGuardianId,
                    content: inputText,
                    type: "text",
                },
                {
                    onSuccess: () => setInputText(""),
                }
            );
        },
        [inputText, isSending, myGuardianId, roomId, sendMessage]
    );

    const handleProposeSchedule = useCallback(
        async (scheduleData: { date: string; time: string; location: string }) => {
            if (!myGuardianId || !partner?.guardianId) return;

            const rawDateTime = new Date(`${scheduleData.date}T${scheduleData.time}:00`);
            if (Number.isNaN(rawDateTime.getTime())) {
                throw new Error("날짜/시간 형식이 올바르지 않습니다.");
            }

            const datetime = rawDateTime.toISOString();
            const title = `${partner.nickname}와 산책 약속`;

            try {
                const created = await createScheduleAsync({
                    room_id: roomId,
                    organizer_id: myGuardianId,
                    title,
                    datetime,
                    participant_ids: [myGuardianId, partner.guardianId],
                    location_name: scheduleData.location,
                    place_detail: scheduleData.location,
                    status: "proposed",
                    proposal_status: "proposed",
                });

                await sendMessageAsync({
                    room_id: roomId,
                    sender_id: myGuardianId,
                    content: "새로운 산책 약속을 제안했습니다.",
                    type: "schedule",
                    metadata: {
                        ...scheduleData,
                        scheduleId: created.id,
                        status: created.status,
                    },
                });
            } catch (error) {
                console.error("[chat/schedule] create failed", {
                    roomId,
                    myGuardianId,
                    partnerGuardianId: partner.guardianId,
                    scheduleData,
                    error,
                });
                throw error instanceof Error
                    ? error
                    : new Error("약속 제안 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
            }
        },
        [createScheduleAsync, myGuardianId, partner?.guardianId, partner?.nickname, roomId, sendMessageAsync]
    );

    const handleRespondSchedule = useCallback(
        (scheduleId: string, response: "accepted" | "rejected") => {
            if (!myGuardianId) return;

            respondSchedule(
                {
                    schedule_id: scheduleId,
                    proposal_status: response,
                },
                {
                    onSuccess: (updated) => {
                        sendMessage({
                            room_id: roomId,
                            sender_id: myGuardianId,
                            content:
                                response === "accepted"
                                    ? "약속 제안을 수락했습니다."
                                    : "약속 제안을 거절했습니다.",
                            type: "system",
                            metadata: {
                                scheduleId: updated.id,
                                status: updated.status,
                                proposalStatus: updated.proposal_status,
                            },
                        });
                    },
                    onError: (error) => {
                        alert(error instanceof Error ? error.message : "약속 응답 처리에 실패했습니다.");
                    },
                }
            );
        },
        [myGuardianId, respondSchedule, roomId, sendMessage]
    );

    return (
        <div className="flex flex-col h-[100dvh] bg-background">
            <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="flex items-center gap-3">
                    <TapScale>
                        <button onClick={() => router.back()} className="p-1 -ml-1 text-foreground">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    </TapScale>
                    <div className="font-semibold text-foreground">{partner?.nickname ?? "채팅"}</div>
                </div>

                <TapScale>
                    <button
                        onClick={() => setIsScheduleOpen(true)}
                        disabled={!myGuardianId || !partner?.guardianId || isCreatingSchedule}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-light/20 text-primary rounded-full text-sm font-medium disabled:opacity-50"
                    >
                        <CalendarClock className="w-4 h-4" />
                        {isCreatingSchedule ? "약속 생성 중..." : "약속잡기"}
                    </button>
                </TapScale>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                {messagesError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                        채팅 메시지 조회 실패:{" "}
                        {messagesError instanceof Error ? messagesError.message : "알 수 없는 오류"}
                    </div>
                ) : null}

                {isLoading && (
                    <div className="space-y-4">
                        <ChatMessageSkeleton isMe={false} />
                        <ChatMessageSkeleton isMe />
                        <ChatMessageSkeleton isMe={false} />
                    </div>
                )}

                {messages?.map((message) => {
                    const isMe = message.sender_id === myGuardianId;
                    const timeString = new Date(message.created_at).toLocaleTimeString("ko-KR", {
                        hour: "numeric",
                        minute: "2-digit",
                    });

                    const metadata = (message.metadata as Record<string, unknown>) || {};
                    const scheduleId =
                        typeof metadata.scheduleId === "string" ? metadata.scheduleId : null;
                    const scheduleDate = typeof metadata.date === "string" ? metadata.date : "";
                    const scheduleTime = typeof metadata.time === "string" ? metadata.time : "";
                    const scheduleLocation =
                        typeof metadata.location === "string" ? metadata.location : "";
                    const scheduleResponse = scheduleId
                        ? scheduleResponseById.get(scheduleId) ?? null
                        : null;

                    return (
                        <div
                            key={message.id}
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
                                {message.type === "schedule" ? (
                                    <div className="space-y-2">
                                        <p className="font-semibold pb-1 border-b border-black/10">약속 제안</p>
                                        <div className="text-sm space-y-1">
                                            <p>
                                                {scheduleDate} {scheduleTime}
                                            </p>
                                            <p>{scheduleLocation}</p>
                                        </div>
                                        {!isMe && !scheduleResponse && (
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (scheduleId) {
                                                            handleRespondSchedule(scheduleId, "rejected");
                                                        } else {
                                                            alert("연결된 약속 ID가 없어 처리할 수 없습니다. 새 약속을 다시 제안해 주세요.");
                                                        }
                                                    }}
                                                    disabled={isRespondingSchedule}
                                                    className="flex-1 py-1.5 bg-black/5 text-foreground rounded-xl text-sm font-medium hover:bg-black/10 transition-colors disabled:opacity-50"
                                                >
                                                    거절
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (scheduleId) {
                                                            handleRespondSchedule(scheduleId, "accepted");
                                                        } else {
                                                            alert("연결된 약속 ID가 없어 처리할 수 없습니다. 새 약속을 다시 제안해 주세요.");
                                                        }
                                                    }}
                                                    disabled={isRespondingSchedule}
                                                    className="flex-1 py-1.5 bg-primary text-white rounded-xl text-sm font-medium shadow-sm hover:brightness-110 transition-all disabled:opacity-50"
                                                >
                                                    수락하기
                                                </button>
                                            </div>
                                        )}
                                        {!isMe && scheduleResponse ? (
                                            <p className="mt-2 text-xs text-foreground-muted">
                                                {scheduleResponse === "accepted"
                                                    ? "이미 수락 처리된 약속입니다."
                                                    : "이미 거절 처리된 약속입니다."}
                                            </p>
                                        ) : null}
                                    </div>
                                ) : (
                                    message.content
                                )}
                            </div>
                            <span className="text-[11px] text-foreground-muted mt-1 px-1">{timeString}</span>
                        </div>
                    );
                })}

                <div ref={messagesEndRef} />
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-3 pb-safe">
                <form onSubmit={handleSend} className="container mx-auto max-w-md flex items-center gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(event) => setInputText(event.target.value)}
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

            <ScheduleModal
                isOpen={isScheduleOpen}
                onClose={() => setIsScheduleOpen(false)}
                onPropose={handleProposeSchedule}
                isSubmitting={isCreatingSchedule}
            />
        </div>
    );
}

function ChatMessageSkeleton({ isMe }: { isMe: boolean }) {
    return (
        <div className={cn("flex flex-col max-w-[75%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
            <Skeleton className={cn("h-10 rounded-3xl", isMe ? "w-40 rounded-br-sm" : "w-52 rounded-bl-sm")} />
            <Skeleton className="h-3 w-12 rounded-xl mt-1" />
        </div>
    );
}
