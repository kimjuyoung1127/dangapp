// File: Component tests for B2B progress summary rendering on modes page.
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ModesPage from "@/app/(main)/modes/page";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useModeUnlocks } from "@/lib/hooks/useMode";
import { useMyReservations, usePartnerPlaces } from "@/lib/hooks/useCare";
import { useDogOwnerships, useMyScheduleParticipants } from "@/lib/hooks/useFamily";

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/link", () => ({
    default: ({ children, href }: { children: ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
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

const mockedUseCurrentGuardian = vi.mocked(useCurrentGuardian);
const mockedUseModeUnlocks = vi.mocked(useModeUnlocks);
const mockedUsePartnerPlaces = vi.mocked(usePartnerPlaces);
const mockedUseMyReservations = vi.mocked(useMyReservations);
const mockedUseDogOwnerships = vi.mocked(useDogOwnerships);
const mockedUseMyScheduleParticipants = vi.mocked(useMyScheduleParticipants);

describe("ModesPage B2B summary", () => {
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
            data: [{ id: "place-1" }],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        } as unknown as ReturnType<typeof usePartnerPlaces>);

        mockedUseMyReservations.mockReturnValue({
            data: [{ id: "r1", status: "pending" }, { id: "r2", status: "confirmed" }],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        } as unknown as ReturnType<typeof useMyReservations>);

        mockedUseDogOwnerships.mockReturnValue({
            data: [{ dog_id: "dog-1" }],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        } as unknown as ReturnType<typeof useDogOwnerships>);

        mockedUseMyScheduleParticipants.mockReturnValue({
            data: [
                { schedule_id: "s1", status: "accepted" },
                { schedule_id: "s2", status: "invited" },
            ],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        } as unknown as ReturnType<typeof useMyScheduleParticipants>);
    });

    it("renders care/family metrics and links", () => {
        render(<ModesPage />);

        expect(screen.getByText("B2B execution status")).toBeInTheDocument();
        expect(screen.getByText("Partner places 1")).toBeInTheDocument();
        expect(screen.getByText("Reservations 2")).toBeInTheDocument();
        expect(screen.getByText("Ownership links 1")).toBeInTheDocument();
        expect(screen.getByText("Shared participants 2")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Open Care" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Open Family" })).toBeInTheDocument();
    });

    it("shows retry button and refetches all B2B queries on error", () => {
        const refetchPartnerPlaces = vi.fn();
        const refetchReservations = vi.fn();
        const refetchOwnerships = vi.fn();
        const refetchParticipants = vi.fn();

        mockedUsePartnerPlaces.mockReturnValue({
            data: [],
            isLoading: false,
            isError: true,
            refetch: refetchPartnerPlaces,
        } as unknown as ReturnType<typeof usePartnerPlaces>);
        mockedUseMyReservations.mockReturnValue({
            data: [],
            isLoading: false,
            isError: true,
            refetch: refetchReservations,
        } as unknown as ReturnType<typeof useMyReservations>);
        mockedUseDogOwnerships.mockReturnValue({
            data: [],
            isLoading: false,
            isError: true,
            refetch: refetchOwnerships,
        } as unknown as ReturnType<typeof useDogOwnerships>);
        mockedUseMyScheduleParticipants.mockReturnValue({
            data: [],
            isLoading: false,
            isError: true,
            refetch: refetchParticipants,
        } as unknown as ReturnType<typeof useMyScheduleParticipants>);

        render(<ModesPage />);

        fireEvent.click(screen.getByRole("button", { name: "Retry" }));

        expect(refetchPartnerPlaces).toHaveBeenCalledTimes(1);
        expect(refetchReservations).toHaveBeenCalledTimes(1);
        expect(refetchOwnerships).toHaveBeenCalledTimes(1);
        expect(refetchParticipants).toHaveBeenCalledTimes(1);
    });

    it("shows summary skeleton while B2B queries are loading", () => {
        mockedUsePartnerPlaces.mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
            refetch: vi.fn(),
        } as unknown as ReturnType<typeof usePartnerPlaces>);

        render(<ModesPage />);
        expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
    });
});
