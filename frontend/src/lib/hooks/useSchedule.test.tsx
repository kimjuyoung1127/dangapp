// File: Hook tests for standardized schedule response mutation outcomes.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import React from "react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/client";
import { useRespondSchedule } from "@/lib/hooks/useSchedule";

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
    Wrapper.displayName = "QueryClientWrapper";
    return Wrapper;
}

function makeScheduleMutationClient(result: { data: unknown; error: unknown }) {
    const chain = {
        update: vi.fn(),
        eq: vi.fn(),
        select: vi.fn(),
        limit: vi.fn(),
    };

    chain.update.mockReturnValue(chain);
    chain.eq.mockReturnValue(chain);
    chain.select.mockReturnValue(chain);
    chain.limit.mockResolvedValue(result);

    return {
        from: vi.fn().mockReturnValue(chain),
    };
}

describe("useRespondSchedule", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("returns updated schedule on success", async () => {
        const schedule = { id: "schedule-1", room_id: "room-1" };
        mockedCreateClient.mockReturnValue(
            makeScheduleMutationClient({
                data: [schedule],
                error: null,
            }) as unknown as ReturnType<typeof createClient>
        );

        const { result } = renderHook(() => useRespondSchedule(), { wrapper: makeWrapper() });

        await expect(
            result.current.mutateAsync({
                schedule_id: "schedule-1",
                proposal_status: "accepted",
            })
        ).resolves.toMatchObject({ id: "schedule-1" });
    });

    it("maps 406-like responses to ALREADY_RESPONDED", async () => {
        mockedCreateClient.mockReturnValue(
            makeScheduleMutationClient({
                data: null,
                error: { status: 406, code: "PGRST116", message: "Not Acceptable" },
            }) as unknown as ReturnType<typeof createClient>
        );

        const { result } = renderHook(() => useRespondSchedule(), { wrapper: makeWrapper() });

        await expect(
            result.current.mutateAsync({
                schedule_id: "schedule-1",
                proposal_status: "accepted",
            })
        ).rejects.toMatchObject({
            name: "RespondScheduleMutationError",
            code: "ALREADY_RESPONDED",
        });
    });

    it("maps zero-row update to ALREADY_RESPONDED", async () => {
        mockedCreateClient.mockReturnValue(
            makeScheduleMutationClient({
                data: [],
                error: null,
            }) as unknown as ReturnType<typeof createClient>
        );

        const { result } = renderHook(() => useRespondSchedule(), { wrapper: makeWrapper() });

        await expect(
            result.current.mutateAsync({
                schedule_id: "schedule-1",
                proposal_status: "rejected",
            })
        ).rejects.toMatchObject({
            code: "ALREADY_RESPONDED",
        });
    });

    it("maps network/server errors to UNKNOWN", async () => {
        mockedCreateClient.mockReturnValue(
            makeScheduleMutationClient({
                data: null,
                error: { status: 500, code: "XX000", message: "Internal error" },
            }) as unknown as ReturnType<typeof createClient>
        );

        const { result } = renderHook(() => useRespondSchedule(), { wrapper: makeWrapper() });

        await expect(
            result.current.mutateAsync({
                schedule_id: "schedule-1",
                proposal_status: "accepted",
            })
        ).rejects.toMatchObject({
            code: "UNKNOWN",
        });
    });
});
