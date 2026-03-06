// File: Component tests for family page ownership and shared schedule states.
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FamilyPage from "@/app/(main)/family/page";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import {
    useDogOwnerships,
    useFamilyGroups,
    useFamilyMembers,
    useFamilySharedSchedules,
    useMyScheduleParticipants,
} from "@/lib/hooks/useFamily";

vi.mock("next/link", () => ({
    default: ({ children, href }: { children: ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock("@/components/shared/AppShell", () => ({
    AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/MotionWrappers", () => ({
    TapScale: ({ children }: { children: ReactNode }) => <>{children}</>,
    StaggerList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    StaggerItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    ScrollReveal: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    BottomSheet: ({ children, isOpen }: { children: ReactNode; isOpen: boolean }) =>
        isOpen ? <div>{children}</div> : null,
}));

vi.mock("@/components/ui/Skeleton", () => ({
    Skeleton: () => <div data-testid="skeleton" />,
}));

vi.mock("@/components/features/family/FamilyGroupCard", () => ({
    default: ({ group }: { group: { name: string } }) => <div>{group.name}</div>,
}));

vi.mock("@/components/features/family/FamilyGroupForm", () => ({
    default: () => null,
}));

vi.mock("@/lib/hooks/useCurrentGuardian", () => ({
    useCurrentGuardian: vi.fn(),
}));

vi.mock("@/lib/hooks/useFamily", () => ({
    useFamilyGroups: vi.fn(),
    useFamilyMembers: vi.fn(),
    useDogOwnerships: vi.fn(),
    useMyScheduleParticipants: vi.fn(),
    useFamilySharedSchedules: vi.fn(),
    useCreateFamilyGroup: vi.fn(),
    useAddFamilyMember: vi.fn(),
}));

const mockedUseCurrentGuardian = vi.mocked(useCurrentGuardian);
const mockedUseFamilyGroups = vi.mocked(useFamilyGroups);
const mockedUseFamilyMembers = vi.mocked(useFamilyMembers);
const mockedUseDogOwnerships = vi.mocked(useDogOwnerships);
const mockedUseMyScheduleParticipants = vi.mocked(useMyScheduleParticipants);
const mockedUseFamilySharedSchedules = vi.mocked(useFamilySharedSchedules);

describe("FamilyPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockedUseCurrentGuardian.mockReturnValue({
            data: {
                id: "guardian-1",
                dogs: [{ id: "dog-1", name: "우주" }],
            },
        } as unknown as ReturnType<typeof useCurrentGuardian>);

        mockedUseFamilyGroups.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        } as unknown as ReturnType<typeof useFamilyGroups>);

        mockedUseFamilyMembers.mockReturnValue({
            data: [],
            isError: false,
        } as unknown as ReturnType<typeof useFamilyMembers>);

        mockedUseDogOwnerships.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        } as unknown as ReturnType<typeof useDogOwnerships>);

        mockedUseMyScheduleParticipants.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        } as unknown as ReturnType<typeof useMyScheduleParticipants>);

        mockedUseFamilySharedSchedules.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        } as unknown as ReturnType<typeof useFamilySharedSchedules>);
    });

    it("shows empty ownership state", () => {
        render(<FamilyPage />);
        expect(screen.getByText("연결된 공동 양육 반려견이 없습니다.")).toBeInTheDocument();
    });

    it("retries participants and shared schedules together on error", () => {
        const refetchParticipants = vi.fn();
        const refetchSharedSchedules = vi.fn();

        mockedUseMyScheduleParticipants.mockReturnValue({
            data: [],
            isLoading: false,
            isError: true,
            refetch: refetchParticipants,
        } as unknown as ReturnType<typeof useMyScheduleParticipants>);

        mockedUseFamilySharedSchedules.mockReturnValue({
            data: [],
            isLoading: false,
            isError: true,
            refetch: refetchSharedSchedules,
        } as unknown as ReturnType<typeof useFamilySharedSchedules>);

        render(<FamilyPage />);

        fireEvent.click(screen.getByRole("button", { name: "참여 일정 다시 불러오기" }));
        expect(refetchParticipants).toHaveBeenCalledTimes(1);
        expect(refetchSharedSchedules).toHaveBeenCalledTimes(1);
    });

    it("renders shared schedule item with participant status", () => {
        mockedUseMyScheduleParticipants.mockReturnValue({
            data: [
                {
                    schedule_id: "schedule-1",
                    guardian_id: "guardian-1",
                    dog_id: null,
                    status: "accepted",
                    joined_at: "2026-03-06T11:00:00.000Z",
                },
            ],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        } as unknown as ReturnType<typeof useMyScheduleParticipants>);

        mockedUseFamilySharedSchedules.mockReturnValue({
            data: [
                {
                    schedule_id: "schedule-1",
                    participant_status: "accepted",
                    joined_at: "2026-03-06T11:00:00.000Z",
                    title: "서울숲 산책",
                    datetime: "2026-03-07T10:00:00.000Z",
                    schedule_status: "confirmed",
                },
            ],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        } as unknown as ReturnType<typeof useFamilySharedSchedules>);

        render(<FamilyPage />);

        expect(screen.getByText("서울숲 산책")).toBeInTheDocument();
        expect(screen.getByText("수락")).toBeInTheDocument();
        expect(screen.getByText("일정 상태: 확정")).toBeInTheDocument();
    });
});
