// File: Family-style chat room with realtime messaging and schedule proposal actions.
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarClock, ChevronLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { ScheduleModal } from "@/components/features/chat/ScheduleModal";
import { FamilyStatusChip } from "@/components/shared/FamilyUi";
import { TapScale } from "@/components/ui/MotionWrappers";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useChatPartner, useChatRoom, useMarkAsRead, useSendMessage } from "@/lib/hooks/useChat";
import {
    RespondScheduleMutationError,
    useCreateSchedule,
    useRespondSchedule,
} from "@/lib/hooks/useSchedule";
import {
    buildScheduleResponseMap,
    getScheduleResponseState,
    isScheduleResponseActionable,
} from "@/lib/scheduleResponse";
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
    const [pendingResponseScheduleId, setPendingResponseScheduleId] = useState<string | null>(null);
    const pendingResponseScheduleIdRef = useRef<string | null>(null);

    const { data: partner } = useChatPartner(roomId, myGuardianId);

    const scheduleResponseById = useMemo(() => buildScheduleResponseMap(messages ?? []), [messages]);

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

    const handleComposerKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (event.key === "Enter" && !event.shiftKey) {
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
            }
        },
        [inputText, isSending, myGuardianId, roomId, sendMessage]
    );

    const handleProposeSchedule = useCallback(
        async (scheduleData: { date: string; time: string; location: string }) => {
            if (!myGuardianId || !partner?.guardianId) return;

            const rawDateTime = new Date(`${scheduleData.date}T${scheduleData.time}:00`);
            if (Number.isNaN(rawDateTime.getTime())) {
                throw new Error("날짜와 시간을 다시 확인해 주세요.");
            }

            const datetime = rawDateTime.toISOString();
            const title = `${partner.nickname}님과의 산책 약속`;

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
                    content: "새 산책 일정을 제안했어요.",
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
                    : new Error("일정 제안에 실패했습니다. 잠시 후 다시 시도해 주세요.");
            }
        },
        [createScheduleAsync, myGuardianId, partner?.guardianId, partner?.nickname, roomId, sendMessageAsync]
    );

    const handleRespondSchedule = useCallback(
        (scheduleId: string, response: "accepted" | "rejected") => {
            if (!myGuardianId) return;
            if (pendingResponseScheduleIdRef.current === scheduleId) return;

            pendingResponseScheduleIdRef.current = scheduleId;
            setPendingResponseScheduleId(scheduleId);

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
                                    ? "일정 제안을 수락했어요."
                                    : "일정 제안을 거절했어요.",
                            type: "system",
                            metadata: {
                                scheduleId: updated.id,
                                status: updated.status,
                                proposalStatus: updated.proposal_status,
                            },
                        });
                    },
                    onError: (error) => {
                        if (error instanceof RespondScheduleMutationError) {
                            alert(error.message);
                            return;
                        }
                        alert(error instanceof Error ? error.message : "일정 응답 처리에 실패했습니다.");
                    },
                    onSettled: () => {
                        if (pendingResponseScheduleIdRef.current === scheduleId) {
                            pendingResponseScheduleIdRef.current = null;
                            setPendingResponseScheduleId(null);
                        }
                    },
                }
            );
        },
        [myGuardianId, respondSchedule, roomId, sendMessage]
    );

    return (
        <div className="flex h-[100dvh] flex-col bg-sky-50/60">
            <header className="sticky top-0 z-40 border-b border-sky-100 bg-white/95 backdrop-blur">
                <div className="mx-auto flex w-full max-w-md items-start justify-between gap-3 px-4 pb-4 pt-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <TapScale>
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-700"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            </TapScale>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">
                                    일정 대화
                                </p>
                                <h1 className="truncate text-lg font-semibold text-foreground">
                                    {partner?.nickname ?? "채팅"}
                                </h1>
                            </div>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-foreground-muted">
                            대화와 일정 제안을 같은 흐름에서 정리해 두세요.
                        </p>
                    </div>

                    <TapScale>
                        <button
                            type="button"
                            onClick={() => setIsScheduleOpen(true)}
                            disabled={!myGuardianId || !partner?.guardianId || isCreatingSchedule}
                            className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
                        >
                            <CalendarClock className="h-4 w-4" />
                            {isCreatingSchedule ? "생성 중" : "일정 제안"}
                        </button>
                    </TapScale>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-28">
                <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-5">
                    {messagesError ? (
                        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            채팅 메시지를 불러오지 못했습니다.
                            <div className="mt-1 text-xs">
                                {messagesError instanceof Error ? messagesError.message : "알 수 없는 오류"}
                            </div>
                        </div>
                    ) : null}

                    {isLoading ? (
                        <div className="space-y-4">
                            <ChatMessageSkeleton isMe={false} />
                            <ChatMessageSkeleton isMe />
                            <ChatMessageSkeleton isMe={false} />
                        </div>
                    ) : null}

                    {!isLoading && !messages?.length ? (
                        <div className="rounded-[1.75rem] border border-sky-100 bg-white p-5 text-center shadow-sm">
                            <p className="text-sm text-foreground-muted">
                                아직 대화가 없어요. 첫 인사를 보내고 함께 걸을 시간을 잡아보세요.
                            </p>
                        </div>
                    ) : null}

                    {messages?.map((message) => {
                        const isMe = message.sender_id === myGuardianId;
                        const timeString = new Date(message.created_at).toLocaleTimeString("ko-KR", {
                            hour: "numeric",
                            minute: "2-digit",
                        });

                        const metadata = (message.metadata as Record<string, unknown>) || {};
                        const scheduleId = typeof metadata.scheduleId === "string" ? metadata.scheduleId : null;
                        const scheduleDate = typeof metadata.date === "string" ? metadata.date : "";
                        const scheduleTime = typeof metadata.time === "string" ? metadata.time : "";
                        const scheduleLocation = typeof metadata.location === "string" ? metadata.location : "";
                        const scheduleResponse = scheduleId
                            ? getScheduleResponseState(scheduleResponseById, scheduleId)
                            : "none";
                        const isActionPending = pendingResponseScheduleId === scheduleId;
                        const canRespond = isScheduleResponseActionable({
                            isMyMessage: isMe,
                            scheduleId,
                            responseState: scheduleResponse,
                            pendingScheduleId: pendingResponseScheduleId,
                        });

                        return (
                            <div key={message.id} className={cn("flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
                                <div
                                    className={cn(
                                        "max-w-[86%] rounded-[1.5rem] border px-4 py-3 shadow-sm",
                                        isMe
                                            ? "border-sky-200 bg-sky-600 text-white"
                                            : "border-sky-100 bg-white text-foreground"
                                    )}
                                >
                                    {message.type === "schedule" ? (
                                        <ScheduleMessageCard
                                            isMe={isMe}
                                            scheduleDate={scheduleDate}
                                            scheduleTime={scheduleTime}
                                            scheduleLocation={scheduleLocation}
                                            responseState={scheduleResponse}
                                            isActionPending={isActionPending}
                                            isRespondingSchedule={isRespondingSchedule}
                                            canRespond={canRespond}
                                            onReject={() => {
                                                if (scheduleId) {
                                                    handleRespondSchedule(scheduleId, "rejected");
                                                    return;
                                                }
                                                alert("연결된 일정 정보가 없어 처리할 수 없습니다.");
                                            }}
                                            onAccept={() => {
                                                if (scheduleId) {
                                                    handleRespondSchedule(scheduleId, "accepted");
                                                    return;
                                                }
                                                alert("연결된 일정 정보가 없어 처리할 수 없습니다.");
                                            }}
                                        />
                                    ) : (
                                        <p className="text-[15px] leading-7">{message.content}</p>
                                    )}
                                </div>
                                <span className="px-1 text-[11px] text-foreground-muted">{timeString}</span>
                            </div>
                        );
                    })}

                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-sky-100 bg-white/95 backdrop-blur">
                <div className="mx-auto w-full max-w-md px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3">
                    <form onSubmit={handleSend} className="flex items-end gap-3">
                        <div className="flex-1 rounded-[1.5rem] border border-sky-100 bg-sky-50/70 px-4 py-3 shadow-sm">
                            <textarea
                                value={inputText}
                                onChange={(event) => setInputText(event.target.value)}
                                onKeyDown={handleComposerKeyDown}
                                placeholder="메시지를 입력해 주세요."
                                rows={1}
                                className="max-h-28 min-h-[28px] w-full resize-none bg-transparent text-[15px] text-foreground outline-none placeholder:text-foreground-muted"
                            />
                        </div>
                        <TapScale>
                            <button
                                type="submit"
                                disabled={!inputText.trim() || isSending}
                                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm disabled:bg-sky-200"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </TapScale>
                    </form>
                </div>
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

function ScheduleMessageCard({
    isMe,
    scheduleDate,
    scheduleTime,
    scheduleLocation,
    responseState,
    isActionPending,
    isRespondingSchedule,
    canRespond,
    onReject,
    onAccept,
}: {
    isMe: boolean;
    scheduleDate: string;
    scheduleTime: string;
    scheduleLocation: string;
    responseState: "none" | "accepted" | "rejected";
    isActionPending: boolean;
    isRespondingSchedule: boolean;
    canRespond: boolean;
    onReject: () => void;
    onAccept: () => void;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <p className={cn("text-sm font-semibold", isMe ? "text-white" : "text-foreground")}>
                    산책 일정 제안
                </p>
                {responseState !== "none" ? (
                    <FamilyStatusChip
                        label={responseState === "accepted" ? "수락됨" : "거절됨"}
                        tone={responseState === "accepted" ? "success" : "danger"}
                    />
                ) : null}
            </div>

            <div className={cn("rounded-[1.25rem] px-3 py-3", isMe ? "bg-white/10 text-white" : "bg-sky-50 text-foreground")}>
                <p className="text-sm font-medium">
                    {scheduleDate} {scheduleTime}
                </p>
                <p className={cn("mt-1 text-sm", isMe ? "text-white/90" : "text-foreground-muted")}>
                    {scheduleLocation}
                </p>
            </div>

            {canRespond ? (
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={onReject}
                        disabled={isRespondingSchedule || isActionPending}
                        className={cn(
                            "rounded-[1rem] px-3 py-2 text-sm font-semibold",
                            isMe ? "bg-white/15 text-white" : "border border-sky-200 bg-white text-foreground"
                        )}
                    >
                        거절
                    </button>
                    <button
                        type="button"
                        onClick={onAccept}
                        disabled={isRespondingSchedule || isActionPending}
                        className={cn(
                            "rounded-[1rem] px-3 py-2 text-sm font-semibold",
                            isMe ? "bg-white text-sky-700" : "bg-sky-600 text-white"
                        )}
                    >
                        수락
                    </button>
                </div>
            ) : null}

            {!isMe && isActionPending ? (
                <p className="text-xs text-foreground-muted">응답을 처리하고 있어요.</p>
            ) : null}
        </div>
    );
}

function ChatMessageSkeleton({ isMe }: { isMe: boolean }) {
    return (
        <div className={cn("flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
            <Skeleton className={cn("h-16 w-[72%] rounded-[1.5rem]", isMe ? "bg-sky-200/80" : "bg-white")} />
            <Skeleton className="h-3 w-12 rounded-xl" />
        </div>
    );
}
