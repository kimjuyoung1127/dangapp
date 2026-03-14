import { render, screen } from "@testing-library/react";
import React from "react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ModesPage from "@/app/(main)/modes/page";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useModeUnlocks } from "@/lib/hooks/useMode";
import { useMyReservations, usePartnerPlaces } from "@/lib/hooks/useCare";
import { useDogOwnerships, useMyScheduleParticipants } from "@/lib/hooks/useFamily";
import { useModesDebugDemo } from "@/lib/hooks/useDebugDemoFallback";

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/link", () => ({
    default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/shared/AppShell", () => ({
    AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/features/modes/ModeCard", () => ({
    default: ({ config }: { config: { label: string } }) => <div>{config.label}</div>,
}));

vi.mock("@/components/features/modes/ModeUnlockDialog", () => ({
    default: () => null,
}));

vi.mock("@/components/ui/Skeleton", () => ({
    Skeleton: () => <div data-testid="skeleton" />,
}));

vi.mock("@/lib/hooks/useCurrentGuardian", () => ({
    useCurrentGuardian: vi.fn(),
}));

vi.mock("@/lib/hooks/useMode", () => ({
    useModeUnlocks: vi.fn(),
}));

vi.mock("@/lib/hooks/useCare", () => ({
    usePartnerPlaces: vi.fn(),
    useMyReservations: vi.fn(),
}));

vi.mock("@/lib/hooks/useFamily", () => ({
    useDogOwnerships: vi.fn(),
    useMyScheduleParticipants: vi.fn(),
}));

vi.mock("@/lib/hooks/useDebugDemoFallback", () => ({
    useModesDebugDemo: vi.fn(),
}));

const mockedUseCurrentGuardian = vi.mocked(useCurrentGuardian);
const mockedUseModeUnlocks = vi.mocked(useModeUnlocks);
const mockedUsePartnerPlaces = vi.mocked(usePartnerPlaces);
const mockedUseMyReservations = vi.mocked(useMyReservations);
const mockedUseDogOwnerships = vi.mocked(useDogOwnerships);
const mockedUseMyScheduleParticipants = vi.mocked(useMyScheduleParticipants);
const mockedUseModesDebugDemo = vi.mocked(useModesDebugDemo);

describe("ModesPage debug demo fallback", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockedUseCurrentGuardian.mockReturnValue({
            data: {
                id: "guardian-1",
                trust_level: 3,
                trust_score: 80,
            },
        } as unknown as ReturnType<typeof useCurrentGuardian>);

        mockedUseModeUnlocks.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useModeUnlocks>);

        mockedUsePartnerPlaces.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        } as unknown as ReturnType<typeof usePartnerPlaces>);

        mockedUseMyReservations.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        } as unknown as ReturnType<typeof useMyReservations>);

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
    });

    it("renders demo counts when live care and family data are empty", () => {
        mockedUseModesDebugDemo.mockReturnValue({
            data: {
                partnerPlaces: [{ id: "place-1" }],
                reservations: [
                    {
                        id: "reservation-1",
                        place_id: "place-1",
                        guardian_id: "guardian-1",
                        dog_id: "dog-1",
                        reserved_at: "2026-03-09T09:00:00.000Z",
                        status: "pending",
                        guest_count: 1,
                        request_memo: null,
                        created_at: "2026-03-07T00:00:00.000Z",
                    },
                ],
                ownerships: [
                    {
                        dog_id: "dog-1",
                        guardian_id: "guardian-1",
                        role: "owner",
                        is_primary: true,
                        created_at: "2026-03-07T00:00:00.000Z",
                    },
                ],
                participants: [
                    {
                        schedule_id: "schedule-1",
                        guardian_id: "guardian-1",
                        dog_id: "dog-1",
                        status: "accepted",
                        joined_at: "2026-03-07T00:00:00.000Z",
                    },
                ],
            },
        } as ReturnType<typeof useModesDebugDemo>);

        render(<ModesPage />);

        expect(screen.getAllByText("예시 데이터").length).toBeGreaterThan(0);
        expect(screen.getByText("이용 가능한 장소 1곳")).toBeInTheDocument();
        expect(screen.getByText("예약 내역 1건")).toBeInTheDocument();
        expect(screen.getByText("공동 돌봄 연결 1건")).toBeInTheDocument();
        expect(screen.getByText("공유 일정 참여 1건")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "돌봄으로 이동" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "함께 돌봄으로 이동" })).toBeInTheDocument();
    });
});
