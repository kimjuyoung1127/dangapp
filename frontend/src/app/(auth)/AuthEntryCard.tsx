// File: Shared Google OAuth entry UI used by both /login and /register routes.
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import {
    buildAuthConsentCookie,
    createAuthConsentPayload,
    type AuthEntrySource,
} from "@/lib/authConsent";
import { createClient } from "@/lib/supabase/client";

interface AuthEntryCardProps {
    source: AuthEntrySource;
}

function resolveOAuthRedirectUrl() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    const baseUrl = siteUrl && siteUrl.length > 0 ? siteUrl : window.location.origin;
    return new URL("/auth/callback?next=/home", baseUrl).toString();
}

export function AuthEntryCard({ source }: AuthEntryCardProps) {
    const supabase = useMemo(() => createClient(), []);
    const [termsChecked, setTermsChecked] = useState(false);
    const [privacyChecked, setPrivacyChecked] = useState(false);
    const [locationChecked, setLocationChecked] = useState(false);
    const [marketingChecked, setMarketingChecked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const canContinue = termsChecked && privacyChecked && !isSubmitting;
    const isLogin = source === "login";

    const handleGoogleLogin = async () => {
        if (!termsChecked || !privacyChecked) {
            setErrorMessage("이용약관과 개인정보 처리방침에 동의해 주세요.");
            return;
        }

        setErrorMessage(null);
        setIsSubmitting(true);

        const payload = createAuthConsentPayload({
            source,
            terms: termsChecked,
            privacy: privacyChecked,
            location: locationChecked,
            marketing: marketingChecked,
        });

        document.cookie = buildAuthConsentCookie(payload);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: resolveOAuthRedirectUrl(),
            },
        });

        if (error) {
            setIsSubmitting(false);
            setErrorMessage("Google 로그인 시작에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
            <div className="w-full max-w-sm space-y-8 rounded-3xl border border-border bg-card p-8 shadow-sm">
                <div className="space-y-4 text-center">
                    <div className="mx-auto relative h-16 w-36">
                        <Image src="/logo.svg" alt="댕게팅" fill priority className="object-contain" />
                    </div>
                    <h1 className="text-2xl font-display font-bold text-primary">
                        {isLogin ? "로그인" : "회원가입"}
                    </h1>
                    <p className="text-sm text-foreground-muted">
                        {isLogin
                            ? "Google 계정으로 빠르게 로그인하세요."
                            : "Google 계정으로 가입하고 바로 시작하세요."}
                    </p>
                </div>

                <div className="space-y-3 rounded-2xl border border-border bg-background p-4">
                    <label className="flex items-start gap-2 text-sm text-foreground">
                        <input
                            type="checkbox"
                            checked={termsChecked}
                            onChange={(event) => setTermsChecked(event.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-border"
                        />
                        <span>[필수] 이용약관에 동의합니다.</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-foreground">
                        <input
                            type="checkbox"
                            checked={privacyChecked}
                            onChange={(event) => setPrivacyChecked(event.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-border"
                        />
                        <span>[필수] 개인정보 처리방침에 동의합니다.</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-foreground-muted">
                        <input
                            type="checkbox"
                            checked={locationChecked}
                            onChange={(event) => setLocationChecked(event.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-border"
                        />
                        <span>[선택] 위치 정보 제공에 동의합니다.</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-foreground-muted">
                        <input
                            type="checkbox"
                            checked={marketingChecked}
                            onChange={(event) => setMarketingChecked(event.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-border"
                        />
                        <span>[선택] 마케팅 정보 수신에 동의합니다.</span>
                    </label>
                </div>

                {errorMessage ? (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                        {errorMessage}
                    </p>
                ) : (
                    <p className="text-xs text-foreground-muted">
                        필수 동의 2개를 체크해야 Google 로그인을 진행할 수 있습니다.
                    </p>
                )}

                <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    disabled={!canContinue}
                    onClick={handleGoogleLogin}
                >
                    {isSubmitting ? "Google 연결 중..." : "Continue with Google"}
                </Button>

                <p className="text-center text-xs text-foreground-muted">
                    {isLogin ? "아직 계정이 없으신가요?" : "이미 계정이 있으신가요?"}{" "}
                    <Link
                        href={isLogin ? "/register" : "/login"}
                        className="font-medium text-primary hover:underline"
                    >
                        {isLogin ? "회원가입" : "로그인"}
                    </Link>
                </p>
            </div>
        </div>
    );
}
