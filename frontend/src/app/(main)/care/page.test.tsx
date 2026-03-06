// File: Component tests for reservations-first care page behavior.
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

const mockedUseCurrentGuardian = vi.mocked(useCurrentGuardian);
const mockedUsePartnerPlaces = vi.mocked(usePartnerPlaces);
const mockedUseMyReservations = vi.mocked(useMyReservations);
const mockedUseCreateReservation = vi.mocked(useCreateReservation);
const mockedUseCareRequests = vi.mocked(useCareRequests);
const mockedUseCaregiverOptions = vi.mocked(useCaregiverOptions);

describe("CarePage reservations flow", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockedUseCurrentGuardian.mockReturnValue({
            data: {
                id: "guardian-1",
                dogs: [{ id: "dog-1", name: "우주" }],
            },
        } as unknown as ReturnType<typeof useCurrentGuardian>);

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

    it("creates reservation and renders it in list", async () => {
        const mutateAsync = vi.fn().mockResolvedValue({
            id: "res-1",
            place_id: "place-1",
            guardian_id: "guardian-1",
            dog_id: "dog-1",
            reserved_at: "2026-03-07T09:30:00.000Z",
            status: "pending",
            guest_count: 2,
            request_memo: "문 앞에서 연락 부탁드려요",
            created_at: "2026-03-06T12:00:00.000Z",
        });

        mockedUsePartnerPlaces.mockReturnValue({
            data: [
                {
                    id: "place-1",
                    name: "서울숲 3번 출입구",
                    category: "walk",
                    address_name: "서울 성동구",
                    description: null,
                    amenities: [],
                    is_verified: true,
                },
            ],
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
            mutateAsync,
            isPending: false,
        } as unknown as ReturnType<typeof useCreateReservation>);

        render(<CarePage />);

        fireEvent.click(screen.getByRole("button", { name: "예약 추가" }));
        fireEvent.change(screen.getByLabelText("예약 장소"), {
            target: { value: "place-1" },
        });
        fireEvent.change(screen.getByLabelText("예약 일시"), {
            target: { value: "2026-03-07T18:30" },
        });
        fireEvent.change(screen.getByLabelText("예약 인원"), {
            target: { value: "2" },
        });
        fireEvent.change(screen.getByLabelText("예약 메모"), {
            target: { value: "문 앞에서 연락 부탁드려요" },
        });
        fireEvent.click(screen.getByRole("button", { name: "저장" }));

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledTimes(1);
        });
        expect(screen.getByText("예약이 생성되었습니다.")).toBeInTheDocument();
        expect(screen.getByText("대기 중")).toBeInTheDocument();
        expect(screen.getByText("인원: 2명")).toBeInTheDocument();
    });

    it("shows explicit empty state when partner places are empty", () => {
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

        render(<CarePage />);
        expect(screen.getByText("등록된 파트너 장소가 없습니다.")).toBeInTheDocument();
    });

    it("shows retry button when reservation query fails", () => {
        const refetchReservations = vi.fn();

        mockedUsePartnerPlaces.mockReturnValue({
            data: [
                {
                    id: "place-1",
                    name: "서울숲 3번 출입구",
                    category: "walk",
                    address_name: "서울 성동구",
                    description: null,
                    amenities: [],
                    is_verified: true,
                },
            ],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        } as unknown as ReturnType<typeof usePartnerPlaces>);
        mockedUseMyReservations.mockReturnValue({
            data: [],
            isLoading: false,
            isError: true,
            isFetching: false,
            refetch: refetchReservations,
        } as unknown as ReturnType<typeof useMyReservations>);
        mockedUseCreateReservation.mockReturnValue({
            mutateAsync: vi.fn(),
            isPending: false,
        } as unknown as ReturnType<typeof useCreateReservation>);

        render(<CarePage />);

        fireEvent.click(screen.getByRole("button", { name: "예약 다시 불러오기" }));
        expect(refetchReservations).toHaveBeenCalledTimes(1);
    });
});
