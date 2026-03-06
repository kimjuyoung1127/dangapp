// File: Hook tests for family ownership and shared schedule hooks.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import React from "react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/client";
import {
    useDogOwnerships,
    useFamilySharedSchedules,
    useMyScheduleParticipants,
} from "@/lib/hooks/useFamily";

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
    Wrapper.displayName = "FamilyHooksTestWrapper";

    return { wrapper: Wrapper };
}

function makeOwnershipClient(result: { data: unknown; error: unknown }) {
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

function makeParticipantsClient(result: { data: unknown; error: unknown }) {
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

function makeSharedSchedulesClient(
    participantsResult: { data: unknown; error: unknown },
    schedulesResult: { data: unknown; error: unknown }
) {
    const participantChain = {
        select: vi.fn(),
        eq: vi.fn(),
        order: vi.fn(),
        limit: vi.fn(),
    };

    participantChain.select.mockReturnValue(participantChain);
    participantChain.eq.mockReturnValue(participantChain);
    participantChain.order.mockReturnValue(participantChain);
    participantChain.limit.mockResolvedValue(participantsResult);

    const scheduleChain = {
        select: vi.fn(),
        in: vi.fn(),
    };

    scheduleChain.select.mockReturnValue(scheduleChain);
    scheduleChain.in.mockResolvedValue(schedulesResult);

    return {
        from: vi.fn((table: string) => {
            if (table === "schedule_participants") return participantChain;
            if (table === "schedules") return scheduleChain;
            return null;
        }),
    };
}

describe("useFamily hooks", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("loads dog ownership rows", async () => {
        mockedCreateClient.mockReturnValue(
            makeOwnershipClient({
                data: [
                    {
                        dog_id: "dog-1",
                        guardian_id: "guardian-1",
                        role: "owner",
                        is_primary: true,
                        created_at: "2026-03-06T00:00:00.000Z",
                    },
                ],
                error: null,
            }) as unknown as ReturnType<typeof createClient>
        );

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useDogOwnerships("guardian-1"), { wrapper });

        const response = await result.current.refetch();
        expect(response.data?.[0]?.dog_id).toBe("dog-1");
    });

    it("returns query error for participant fetch failure", async () => {
        mockedCreateClient.mockReturnValue(
            makeParticipantsClient({
                data: null,
                error: { message: "participant fetch failed" },
            }) as unknown as ReturnType<typeof createClient>
        );

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useMyScheduleParticipants("guardian-1"), {
            wrapper,
        });

        const response = await result.current.refetch();
        expect(response.error).toMatchObject({ message: "participant fetch failed" });
    });

    it("maps shared schedules with participant status", async () => {
        mockedCreateClient.mockReturnValue(
            makeSharedSchedulesClient(
                {
                    data: [
                        {
                            schedule_id: "schedule-1",
                            guardian_id: "guardian-1",
                            dog_id: null,
                            status: "accepted",
                            joined_at: "2026-03-06T12:00:00.000Z",
                        },
                    ],
                    error: null,
                },
                {
                    data: [
                        {
                            id: "schedule-1",
                            title: "주말 산책",
                            datetime: "2026-03-07T09:00:00.000Z",
                            status: "confirmed",
                        },
                    ],
                    error: null,
                }
            ) as unknown as ReturnType<typeof createClient>
        );

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useFamilySharedSchedules("guardian-1"), {
            wrapper,
        });

        const response = await result.current.refetch();
        expect(response.data).toEqual([
            {
                schedule_id: "schedule-1",
                participant_status: "accepted",
                joined_at: "2026-03-06T12:00:00.000Z",
                title: "주말 산책",
                datetime: "2026-03-07T09:00:00.000Z",
                schedule_status: "confirmed",
            },
        ]);
    });
});
