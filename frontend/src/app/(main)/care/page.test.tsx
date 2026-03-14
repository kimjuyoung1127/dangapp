import { render, screen } from "@testing-library/react";
import React from "react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CarePage from "@/app/(main)/care/page";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import {
    useCareRequests,
    useCaregiverOptions,
    useCreateReservation,
    useMyReservations,
    usePartnerPlaces,
} from "@/lib/hooks/useCare";
import { useCareDebugDemo } from "@/lib/hooks/useDebugDemoFallback";

vi.mock("@/components/shared/AppShell", () => ({
    AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/MotionWrappers", () => ({
    TapScale: ({ children }: { children: ReactNode }) => <>{children}</>,
    BottomSheet: ({ children, isOpen }: { children: ReactNode; isOpen: boolean }) =>
        isOpen ? <div>{children}</div> : null,
}));

vi.mock("@/components/ui/Skeleton", () => ({
    Skeleton: () => <div data-testid="skeleton" />,
}));

vi.mock("@/components/features/care/CareRequestForm", () => ({
    default: () => null,
}));

vi.mock("@/components/features/care/CareRequestList", () => ({
    default: () => null,
}));

vi.mock("@/lib/hooks/useCurrentGuardian", () => ({
    useCurrentGuardian: vi.fn(),
}));

vi.mock("@/lib/hooks/useCare", () => ({
    usePartnerPlaces: vi.fn(),
    useMyReservations: vi.fn(),
    useCreateReservation: vi.fn(),
    useCareRequests: vi.fn(),
    useCaregiverOptions: vi.fn(),
}));

vi.mock("@/lib/hooks/useDebugDemoFallback", () => ({
    useCareDebugDemo: vi.fn(),
}));

const mockedUseCurrentGuardian = vi.mocked(useCurrentGuardian);
const mockedUsePartnerPlaces = vi.mocked(usePartnerPlaces);
const mockedUseMyReservations = vi.mocked(useMyReservations);
const mockedUseCreateReservation = vi.mocked(useCreateReservation);
const mockedUseCareRequests = vi.mocked(useCareRequests);
const mockedUseCaregiverOptions = vi.mocked(useCaregiverOptions);
const mockedUseCareDebugDemo = vi.mocked(useCareDebugDemo);

describe("CarePage debug demo fallback", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockedUseCurrentGuardian.mockReturnValue({
            data: {
                id: "guardian-1",
                dogs: [{ id: "dog-1", name: "Bori" }],
            },
        } as unknown as ReturnType<typeof useCurrentGuardian>);

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
            isFetching: false,
            refetch: vi.fn(),
        } as unknown as ReturnType<typeof useMyReservations>);

        mockedUseCreateReservation.mockReturnValue({
            mutateAsync: vi.fn(),
            isPending: false,
        } as unknown as ReturnType<typeof useCreateReservation>);

        mockedUseCareRequests.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            isFetching: false,
            refetch: vi.fn(),
        } as unknown as ReturnType<typeof useCareRequests>);

        mockedUseCaregiverOptions.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useCaregiverOptions>);
    });

    it("renders demo places and reservations when live data is empty", () => {
        mockedUseCareDebugDemo.mockReturnValue({
            data: {
                places: [
                    {
                        id: "place-1",
                        name: "Seongsu Walk Lounge",
                        category: "park",
                        address_name: "Seongsu-dong",
                        location: null,
                        description: "Quiet morning route.",
                        photo_urls: [],
                        business_hours: null,
                        is_verified: true,
                        amenities: ["water"],
                        created_at: "2026-03-07T00:00:00.000Z",
                        updated_at: "2026-03-07T00:00:00.000Z",
                    },
                ],
                reservations: [
                    {
                        id: "reservation-1",
                        place_id: "place-1",
                        guardian_id: "guardian-1",
                        dog_id: "dog-1",
                        reserved_at: "2026-03-09T09:00:00.000Z",
                        status: "pending",
                        guest_count: 1,
                        request_memo: "Morning handoff",
                        created_at: "2026-03-07T00:00:00.000Z",
                    },
                ],
            },
        } as ReturnType<typeof useCareDebugDemo>);

        render(<CarePage />);

        expect(screen.getAllByText("예시 데이터").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Seongsu Walk Lounge").length).toBeGreaterThan(0);
        expect(screen.getByText("Morning handoff")).toBeInTheDocument();
    });
});
