import { render, screen } from "@testing-library/react";
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
import { useFamilyDebugDemo } from "@/lib/hooks/useDebugDemoFallback";

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
    default: ({ group, memberCount }: { group: { name: string }; memberCount: number }) => (
        <div>
            {group.name} ({memberCount})
        </div>
    ),
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
}));

vi.mock("@/lib/hooks/useDebugDemoFallback", () => ({
    useFamilyDebugDemo: vi.fn(),
}));

const mockedUseCurrentGuardian = vi.mocked(useCurrentGuardian);
const mockedUseFamilyGroups = vi.mocked(useFamilyGroups);
const mockedUseFamilyMembers = vi.mocked(useFamilyMembers);
const mockedUseDogOwnerships = vi.mocked(useDogOwnerships);
const mockedUseMyScheduleParticipants = vi.mocked(useMyScheduleParticipants);
const mockedUseFamilySharedSchedules = vi.mocked(useFamilySharedSchedules);
const mockedUseFamilyDebugDemo = vi.mocked(useFamilyDebugDemo);

describe("FamilyPage debug demo fallback", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockedUseCurrentGuardian.mockReturnValue({
            data: {
                id: "guardian-1",
                dogs: [{ id: "dog-1", name: "Bean" }],
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

    it("renders demo ownerships, schedules, and groups when live data is empty", () => {
        mockedUseFamilyDebugDemo.mockReturnValue({
            data: {
                groups: [
                    {
                        id: "group-1",
                        name: "Weekend Walk Circle",
                        creator_id: "guardian-1",
                        dog_ids: ["dog-1"],
                        created_at: "2026-03-07T00:00:00.000Z",
                    },
                ],
                memberCounts: { "group-1": 3 },
                ownerships: [
                    {
                        dog_id: "dog-1",
                        guardian_id: "guardian-1",
                        role: "owner",
                        is_primary: true,
                        created_at: "2026-03-07T00:00:00.000Z",
                    },
                ],
                dogs: [{ id: "dog-1", name: "Bean" }],
                participants: [
                    {
                        schedule_id: "schedule-1",
                        guardian_id: "guardian-1",
                        dog_id: "dog-1",
                        status: "accepted",
                        joined_at: "2026-03-07T00:00:00.000Z",
                    },
                ],
                sharedSchedules: [
                    {
                        schedule_id: "schedule-1",
                        participant_status: "accepted",
                        joined_at: "2026-03-07T00:00:00.000Z",
                        title: "Saturday river walk",
                        datetime: "2026-03-08T01:00:00.000Z",
                        schedule_status: "confirmed",
                    },
                ],
            },
        } as ReturnType<typeof useFamilyDebugDemo>);

        render(<FamilyPage />);

        expect(screen.getAllByText("예시 데이터").length).toBeGreaterThan(0);
        expect(screen.getByText("Bean")).toBeInTheDocument();
        expect(screen.getByText("Saturday river walk")).toBeInTheDocument();
        expect(screen.getByText("Weekend Walk Circle (3)")).toBeInTheDocument();
    });
});
