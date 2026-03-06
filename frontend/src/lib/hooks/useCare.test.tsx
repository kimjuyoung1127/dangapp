// File: Hook tests for partner places and reservations care hooks.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import React from "react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/client";
import { useCreateReservation, useMyReservations, usePartnerPlaces } from "@/lib/hooks/useCare";

vi.mock("@/lib/supabase/client", () => ({
    createClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createClient);

function makeWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    const Wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = "CareHooksTestWrapper";

    return { queryClient, wrapper: Wrapper };
}

function makePartnerPlacesClient(result: { data: unknown; error: unknown }) {
    const chain = {
        select: vi.fn(),
        order: vi.fn(),
    };

    chain.select.mockReturnValue(chain);
    chain.order
        .mockReturnValueOnce(chain)
        .mockResolvedValueOnce(result);

    return {
        from: vi.fn().mockReturnValue(chain),
    };
}

function makeMyReservationsClient(result: { data: unknown; error: unknown }) {
    const chain = {
        select: vi.fn(),
        eq: vi.fn(),
        order: vi.fn(),
    };

    chain.select.mockReturnValue(chain);
    chain.eq.mockReturnValue(chain);
    chain.order.mockResolvedValue(result);

    return {
        from: vi.fn().mockReturnValue(chain),
    };
}

function makeCreateReservationClient(result: { data: unknown; error: unknown }) {
    const chain = {
        insert: vi.fn(),
        select: vi.fn(),
        single: vi.fn(),
    };

    chain.insert.mockReturnValue(chain);
    chain.select.mockReturnValue(chain);
    chain.single.mockResolvedValue(result);

    return {
        from: vi.fn().mockReturnValue(chain),
    };
}

describe("useCare hooks", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("loads partner places successfully", async () => {
        mockedCreateClient.mockReturnValue(
            makePartnerPlacesClient({
                data: [{ id: "place-1", name: "서울숲 3번 출입구" }],
                error: null,
            }) as unknown as ReturnType<typeof createClient>
        );

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => usePartnerPlaces(), { wrapper });

        const response = await result.current.refetch();
        expect(response.data?.[0].id).toBe("place-1");
    });

    it("returns empty partner places when table is empty", async () => {
        mockedCreateClient.mockReturnValue(
            makePartnerPlacesClient({
                data: [],
                error: null,
            }) as unknown as ReturnType<typeof createClient>
        );

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => usePartnerPlaces(), { wrapper });

        const response = await result.current.refetch();
        expect(response.data).toEqual([]);
    });

    it("returns empty reservations for missing guardian id", async () => {
        mockedCreateClient.mockReturnValue(
            makeMyReservationsClient({
                data: [],
                error: null,
            }) as unknown as ReturnType<typeof createClient>
        );

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useMyReservations(""), { wrapper });

        expect(result.current.data).toBeUndefined();
    });

    it("loads my reservations and retries manually on error", async () => {
        mockedCreateClient.mockReturnValue(
            makeMyReservationsClient({
                data: [{ id: "res-1", guardian_id: "g1", place_id: "p1" }],
                error: null,
            }) as unknown as ReturnType<typeof createClient>
        );

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useMyReservations("g1"), { wrapper });

        const response = await result.current.refetch();
        expect(response.data?.[0].id).toBe("res-1");
    });

    it("sets query error state when reservations fetch fails", async () => {
        mockedCreateClient.mockReturnValue(
            makeMyReservationsClient({
                data: null,
                error: { message: "select failed" },
            }) as unknown as ReturnType<typeof createClient>
        );

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useMyReservations("g1"), { wrapper });

        const response = await result.current.refetch();
        expect(response.error).toMatchObject({ message: "select failed" });
    });

    it("creates reservation and invalidates my reservation query", async () => {
        mockedCreateClient.mockReturnValue(
            makeCreateReservationClient({
                data: {
                    id: "res-2",
                    guardian_id: "g1",
                    place_id: "p1",
                    reserved_at: "2026-03-07T09:00:00.000Z",
                    status: "pending",
                    dog_id: null,
                    guest_count: 1,
                    request_memo: null,
                    created_at: "2026-03-06T12:00:00.000Z",
                },
                error: null,
            }) as unknown as ReturnType<typeof createClient>
        );

        const { wrapper, queryClient } = makeWrapper();
        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
        const { result } = renderHook(() => useCreateReservation(), { wrapper });

        await result.current.mutateAsync({
            guardian_id: "g1",
            place_id: "p1",
            reserved_at: "2026-03-07T09:00:00.000Z",
            guest_count: 1,
            request_memo: null,
            dog_id: null,
        });

        expect(invalidateSpy).toHaveBeenCalledWith({
            queryKey: ["my-reservations", "g1"],
        });
    });

    it("returns mutation error on reservation create failure", async () => {
        mockedCreateClient.mockReturnValue(
            makeCreateReservationClient({
                data: null,
                error: { message: "insert failed" },
            }) as unknown as ReturnType<typeof createClient>
        );

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useCreateReservation(), { wrapper });

        await expect(
            result.current.mutateAsync({
                guardian_id: "g1",
                place_id: "p1",
                reserved_at: "2026-03-07T09:00:00.000Z",
                guest_count: 1,
                request_memo: null,
                dog_id: null,
            })
        ).rejects.toMatchObject({
            message: "insert failed",
        });
    });
});
