// File: Shared Google OAuth entry UI used by both /login and /register routes.
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
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
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fafc_42%,#f8fafc_100%)] px-6 py-10">
            <div className="w-full max-w-sm space-y-6 rounded-[2rem] border border-sky-100 bg-white/95 p-8 shadow-[0_28px_80px_-36px_rgba(14,165,233,0.35)] backdrop-blur">
                <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50">
                        <div className="relative h-10 w-10">
                            <Image src="/logo.svg" alt="댕게팅" fill priority className="object-contain" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                            family direction entry
                        </p>
                        <h1 className="text-2xl font-display font-bold text-foreground">
                            {isLogin ? "다시 만나서 반가워요" : "함께 돌봄을 시작해요"}
                        </h1>
                        <p className="text-sm leading-6 text-foreground-muted">
                            {isLogin
                                ? "기존 계정으로 돌아와 추천, 채팅, 일정을 이어서 확인하세요."
                                : "신뢰 기반 온보딩을 마치고 가족형 돌봄 경험을 시작하세요."}
                        </p>
                    </div>
                </div>

                <div className="rounded-[1.5rem] border border-sky-100 bg-sky-50/70 p-4">
                    <p className="text-sm font-semibold text-foreground">시작 전에 확인할 항목</p>
                    <p className="mt-1 text-xs leading-5 text-foreground-muted">
                        필수 동의를 완료해야 Google 계정 연결을 진행할 수 있습니다.
                    </p>

                    <div className="mt-4 space-y-3">
                        <ConsentRow
                            checked={termsChecked}
                            onChange={setTermsChecked}
                            label="[필수] 이용약관에 동의합니다."
                            strong
                        />
                        <ConsentRow
                            checked={privacyChecked}
                            onChange={setPrivacyChecked}
                            label="[필수] 개인정보 처리방침에 동의합니다."
                            strong
                        />
                        <ConsentRow
                            checked={locationChecked}
                            onChange={setLocationChecked}
                            label="[선택] 위치 정보 제공에 동의합니다."
                        />
                        <ConsentRow
                            checked={marketingChecked}
                            onChange={setMarketingChecked}
                            label="[선택] 마케팅 정보 수신에 동의합니다."
                        />
                    </div>
                </div>

                {errorMessage ? (
                    <p className="rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                        {errorMessage}
                    </p>
                ) : (
                    <div className="rounded-[1rem] bg-sky-50 px-4 py-3 text-xs leading-5 text-foreground-muted">
                        필수 동의 2개를 완료하면 Google로 바로 이동합니다.
                    </div>
                )}

                <Button
                    type="button"
                    size="lg"
                    className="w-full bg-sky-600 hover:bg-sky-700"
                    disabled={!canContinue}
                    onClick={handleGoogleLogin}
                >
                    {isSubmitting ? "Google 연결 중..." : "Google로 계속하기"}
                </Button>

                <p className="text-center text-xs text-foreground-muted">
                    {isLogin ? "아직 계정이 없나요?" : "이미 계정이 있나요?"}{" "}
                    <Link
                        href={isLogin ? "/register" : "/login"}
                        className="font-semibold text-sky-700 hover:underline"
                    >
                        {isLogin ? "회원가입" : "로그인"}
                    </Link>
                </p>
            </div>
        </div>
    );
}

function ConsentRow({
    checked,
    onChange,
    label,
    strong = false,
}: {
    checked: boolean;
    onChange: (next: boolean) => void;
    label: string;
    strong?: boolean;
}) {
    return (
        <label
            className={`flex items-start gap-2 rounded-[1rem] bg-white px-3 py-3 text-sm ${
                strong ? "text-foreground" : "text-foreground-muted"
            }`}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-sky-200"
            />
            <span>{label}</span>
        </label>
    );
}
