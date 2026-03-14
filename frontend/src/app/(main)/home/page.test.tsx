import { render, screen } from "@testing-library/react";
import React from "react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/(main)/home/page";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";
import { useHomeDebugDemo } from "@/lib/hooks/useDebugDemoFallback";
import { useCreateMatchAction, useMatchingGuardians } from "@/lib/hooks/useMatch";
import { useGetOrCreateChatRoom } from "@/lib/hooks/useChat";

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/link", () => ({
    default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/shared/AppShell", () => ({
    AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/MotionWrappers", () => ({
    TapScale: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ui/Skeleton", () => ({
    Skeleton: () => <div data-testid="skeleton" />,
}));

vi.mock("@/components/features/match/MatchCard", () => ({
    default: ({
        profile,
        readOnlyLabel,
    }: {
        profile: { nickname: string };
        readOnlyLabel?: string | null;
    }) => (
        <div>
            <div>{profile.nickname}</div>
            {readOnlyLabel ? <div>{readOnlyLabel}</div> : null}
            <button disabled={!!readOnlyLabel}>관심 보내기</button>
        </div>
    ),
}));

vi.mock("@/components/features/match/IncompleteProfileBanner", () => ({
    default: () => <div>Profile banner</div>,
}));

vi.mock("@/components/features/match/MatchEmptyState", () => ({
    default: () => <div>Empty state</div>,
}));

vi.mock("@/components/features/match/MutualMatchModal", () => ({
    default: () => null,
}));

vi.mock("@/lib/hooks/useCurrentGuardian", () => ({
    useCurrentGuardian: vi.fn(),
}));

vi.mock("@/lib/hooks/useMatch", () => ({
    useMatchingGuardians: vi.fn(),
    useCreateMatchAction: vi.fn(),
}));

vi.mock("@/lib/hooks/useDebugDemoFallback", () => ({
    useHomeDebugDemo: vi.fn(),
}));

vi.mock("@/lib/hooks/useChat", () => ({
    useGetOrCreateChatRoom: vi.fn(),
}));

vi.mock("@/stores/useModeStore", () => ({
    useModeStore: () => ({ activeMode: "family" }),
}));

const mockedUseCurrentGuardian = vi.mocked(useCurrentGuardian);
const mockedUseMatchingGuardians = vi.mocked(useMatchingGuardians);
const mockedUseCreateMatchAction = vi.mocked(useCreateMatchAction);
const mockedUseHomeDebugDemo = vi.mocked(useHomeDebugDemo);
const mockedUseGetOrCreateChatRoom = vi.mocked(useGetOrCreateChatRoom);

describe("HomePage debug demo fallback", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockedUseCurrentGuardian.mockReturnValue({
            data: {
                id: "guardian-1",
                onboarding_progress: 40,
                location: null,
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useCurrentGuardian>);

        mockedUseMatchingGuardians.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useMatchingGuardians>);

        mockedUseCreateMatchAction.mockReturnValue({
            mutate: vi.fn(),
        } as unknown as ReturnType<typeof useCreateMatchAction>);

        mockedUseGetOrCreateChatRoom.mockReturnValue({
            mutate: vi.fn(),
        } as unknown as ReturnType<typeof useGetOrCreateChatRoom>);
    });

    it("renders demo match cards as read-only when live recommendations are empty", () => {
        mockedUseHomeDebugDemo.mockReturnValue({
            data: {
                profiles: [
                    {
                        id: "00000000-0000-0000-0000-00000000d101",
                        nickname: "민지",
                        bio: "예시 소개",
                        address_name: "서울숲",
                        usage_purpose: ["family"],
                        verified_region: true,
                        onboarding_progress: 100,
                        users: { trust_score: 94, trust_level: 5 },
                        dogs: [],
                    },
                ],
            },
        } as ReturnType<typeof useHomeDebugDemo>);

        render(<HomePage />);

        expect(screen.getByText("예시 데이터")).toBeInTheDocument();
        expect(screen.getByText("민지")).toBeInTheDocument();
        expect(screen.getByText("예시 데이터를 보여드리는 중이라 관심 표현은 잠시 비활성화되어 있어요.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "관심 보내기" })).toBeDisabled();
    });
});
