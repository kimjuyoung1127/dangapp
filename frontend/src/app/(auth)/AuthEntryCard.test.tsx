// File: Component tests for Google OAuth consent gating on auth entry screen.
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/client";
import { AuthEntryCard } from "@/app/(auth)/AuthEntryCard";

vi.mock("@/lib/supabase/client", () => ({
    createClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createClient);

describe("AuthEntryCard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
        document.cookie = "";
    });

    it("disables Google OAuth until required consents are checked", async () => {
        const signInWithOAuth = vi.fn().mockResolvedValue({ error: null });
        mockedCreateClient.mockReturnValue({
            auth: { signInWithOAuth },
        } as unknown as ReturnType<typeof createClient>);

        render(<AuthEntryCard source="login" />);

        const submit = screen.getByRole("button", { name: "Continue with Google" });
        expect(submit).toBeDisabled();

        fireEvent.click(screen.getByLabelText("[필수] 이용약관에 동의합니다."));
        fireEvent.click(screen.getByLabelText("[필수] 개인정보 처리방침에 동의합니다."));

        expect(submit).toBeEnabled();
        fireEvent.click(submit);

        expect(signInWithOAuth).toHaveBeenCalledTimes(1);
        expect(signInWithOAuth).toHaveBeenCalledWith({
            provider: "google",
            options: {
                redirectTo: "http://localhost:3000/auth/callback?next=/home",
            },
        });
        expect(document.cookie).toContain("dang_auth_consent=");
    });

    it("shows an error message when Google OAuth start fails", async () => {
        const signInWithOAuth = vi
            .fn()
            .mockResolvedValue({ error: { message: "oauth start failed" } });
        mockedCreateClient.mockReturnValue({
            auth: { signInWithOAuth },
        } as unknown as ReturnType<typeof createClient>);

        render(<AuthEntryCard source="register" />);

        fireEvent.click(screen.getByLabelText("[필수] 이용약관에 동의합니다."));
        fireEvent.click(screen.getByLabelText("[필수] 개인정보 처리방침에 동의합니다."));
        fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));

        expect(await screen.findByText("Google 로그인 시작에 실패했습니다. 잠시 후 다시 시도해 주세요.")).toBeInTheDocument();
    });
});
