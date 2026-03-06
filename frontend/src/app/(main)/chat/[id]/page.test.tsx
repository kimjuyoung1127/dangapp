// File: Component tests for chat-room schedule response UI behaviors.
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "@/components/features/chat/types";
import ChatRoomPage from "@/app/(main)/chat/[id]/page";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import {
    useChatPartner,
    useChatRoom,
    useMarkAsRead,
    useSendMessage,
} from "@/lib/hooks/useChat";
import { useCreateSchedule, useRespondSchedule } from "@/lib/hooks/useSchedule";

const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        back: mockBack,
    }),
}));

vi.mock("@/components/features/chat/ScheduleModal", () => ({
    ScheduleModal: () => null,
}));

vi.mock("@/components/ui/MotionWrappers", () => ({
    TapScale: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ui/Skeleton", () => ({
    Skeleton: () => <div data-testid="skeleton" />,
}));

vi.mock("@/lib/hooks/useCurrentGuardian", () => ({
    useCurrentGuardian: vi.fn(),
}));

vi.mock("@/lib/hooks/useChat", () => ({
    useChatPartner: vi.fn(),
    useChatRoom: vi.fn(),
    useMarkAsRead: vi.fn(),
    useSendMessage: vi.fn(),
}));

vi.mock("@/lib/hooks/useSchedule", () => ({
    useCreateSchedule: vi.fn(),
    useRespondSchedule: vi.fn(),
    RespondScheduleMutationError: class RespondScheduleMutationError extends Error {
        code = "UNKNOWN";
    },
}));

const mockedUseCurrentGuardian = vi.mocked(useCurrentGuardian);
const mockedUseChatPartner = vi.mocked(useChatPartner);
const mockedUseChatRoom = vi.mocked(useChatRoom);
const mockedUseMarkAsRead = vi.mocked(useMarkAsRead);
const mockedUseSendMessage = vi.mocked(useSendMessage);
const mockedUseCreateSchedule = vi.mocked(useCreateSchedule);
const mockedUseRespondSchedule = vi.mocked(useRespondSchedule);

function chatMessage(overrides: Partial<ChatMessage>): ChatMessage {
    return {
        id: `message-${Math.random()}`,
        room_id: "room-1",
        sender_id: "partner-1",
        type: "text",
        content: "",
        metadata: null,
        read_by: null,
        created_at: "2026-03-06T12:00:00.000Z",
        ...overrides,
    };
}

describe("ChatRoomPage schedule response rendering", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockedUseCurrentGuardian.mockReturnValue(
            { data: { id: "me-1" } } as unknown as ReturnType<typeof useCurrentGuardian>
        );
        mockedUseChatPartner.mockReturnValue({
            data: { guardianId: "partner-1", nickname: "우주아빠" },
        } as unknown as ReturnType<typeof useChatPartner>);
        mockedUseMarkAsRead.mockReturnValue(
            { mutate: vi.fn() } as unknown as ReturnType<typeof useMarkAsRead>
        );
        mockedUseSendMessage.mockReturnValue({
            mutate: vi.fn(),
            mutateAsync: vi.fn().mockResolvedValue(undefined),
            isPending: false,
        } as unknown as ReturnType<typeof useSendMessage>);
        mockedUseCreateSchedule.mockReturnValue({
            mutateAsync: vi.fn().mockResolvedValue({ id: "schedule-1", status: "proposed" }),
            isPending: false,
        } as unknown as ReturnType<typeof useCreateSchedule>);
    });

    it("shows processed text and hides buttons for already accepted schedules", () => {
        mockedUseChatRoom.mockReturnValue({
            messages: [
                chatMessage({
                    id: "schedule-proposal",
                    type: "schedule",
                    metadata: {
                        scheduleId: "schedule-1",
                        date: "2026-03-07",
                        time: "18:30",
                        location: "서울숲 3번 출입구",
                    },
                }),
                chatMessage({
                    id: "system-accepted",
                    type: "system",
                    sender_id: "me-1",
                    content: "약속 제안을 수락했습니다.",
                    metadata: {
                        scheduleId: "schedule-1",
                        proposalStatus: "accepted",
                    },
                }),
            ],
            isLoading: false,
            error: null,
        } as unknown as ReturnType<typeof useChatRoom>);

        mockedUseRespondSchedule.mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
        } as unknown as ReturnType<typeof useRespondSchedule>);

        render(<ChatRoomPage params={{ id: "room-1" }} />);

        expect(screen.getByText("이미 수락 처리된 약속입니다.")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "수락하기" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "거절" })).not.toBeInTheDocument();
    });

    it("locks action optimistically to prevent duplicate clicks", () => {
        const mutateSpy = vi.fn();

        mockedUseChatRoom.mockReturnValue({
            messages: [
                chatMessage({
                    id: "schedule-proposal",
                    type: "schedule",
                    metadata: {
                        scheduleId: "schedule-1",
                        date: "2026-03-07",
                        time: "18:30",
                        location: "서울숲 3번 출입구",
                    },
                }),
            ],
            isLoading: false,
            error: null,
        } as unknown as ReturnType<typeof useChatRoom>);

        mockedUseRespondSchedule.mockReturnValue({
            mutate: mutateSpy,
            isPending: false,
        } as unknown as ReturnType<typeof useRespondSchedule>);

        render(<ChatRoomPage params={{ id: "room-1" }} />);

        const acceptButton = screen.getByRole("button", { name: "수락하기" });
        fireEvent.click(acceptButton);

        expect(mutateSpy).toHaveBeenCalledTimes(1);
        expect(screen.getByText("응답 처리 중...")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "수락하기" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "거절" })).not.toBeInTheDocument();
    });
});
