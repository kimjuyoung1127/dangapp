// StepPhoneAuth.tsx — 휴대폰 본인 인증 (DANG-ONB-001)

"use client";

import { useState, useEffect } from "react";
import { useOnboardingStore } from "@/stores/useOnboardingStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function StepPhoneAuth() {
    const { data, setData, nextStep } = useOnboardingStore();
    const [phoneNumber, setPhoneNumber] = useState(data.phone_number || "");
    const [authCode, setAuthCode] = useState("");
    const [isSent, setIsSent] = useState(false);
    const [timer, setTimer] = useState(180); // 3분

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSent && timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isSent, timer]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const handleSendCode = () => {
        if (phoneNumber.length < 10) return;
        setIsSent(true);
        setTimer(180);
        // 실제 API 호출 로직이 들어갈 자리
        console.log("Sending auth code to:", phoneNumber);
    };

    const handleVerify = () => {
        // [디버깅] 인증번호 '1234'로 가정하거나 무조건 통과
        if (authCode === "1234" || process.env.NODE_ENV === "development") {
            setData({ phone_number: phoneNumber, is_phone_verified: true });
            nextStep();
        } else {
            alert("인증번호가 일치하지 않습니다. (테스트용: 1234)");
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 space-y-8">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">안전한 이용을 위해<br />본인 인증을 진행해주세요</h2>
                    <p className="text-sm text-foreground-muted">휴대폰 번호는 이웃 매칭 시 신뢰의 척도가 됩니다.</p>
                </div>

                <div className="space-y-4">
                    {/* 번호 입력 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">휴대폰 번호</label>
                        <div className="flex gap-2">
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                                placeholder="01012345678"
                                disabled={isSent}
                                className="flex-1 px-4 h-14 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all text-lg"
                            />
                            <Button 
                                type="button" 
                                variant={isSent ? "outline" : "primary"}
                                onClick={handleSendCode}
                                className="h-14 px-6"
                            >
                                {isSent ? "재전송" : "인증요청"}
                            </Button>
                        </div>
                    </div>

                    {/* 인증번호 입력 - 전송된 경우에만 노출 */}
                    {isSent && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-sm font-medium text-foreground">인증번호</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={authCode}
                                    onChange={(e) => setAuthCode(e.target.value)}
                                    placeholder="6자리 번호 입력"
                                    className="w-full px-4 h-14 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all text-lg"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-red-500">
                                    {formatTime(timer)}
                                </span>
                            </div>
                            <p className="text-xs text-foreground-muted">인증번호가 오지 않는다면 스팸 문자함을 확인해주세요.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-8">
                <Button 
                    size="lg" 
                    className="w-full h-14 text-lg font-bold"
                    onClick={handleVerify}
                    disabled={!isSent || authCode.length < 4}
                >
                    인증 완료
                </Button>
                
                {/* 디버깅용 강제 이동 버튼 - 개발 환경에서만 노출 */}
                {process.env.NODE_ENV === "development" && (
                    <button 
                        onClick={nextStep}
                        className="w-full mt-4 text-xs text-foreground-muted underline"
                    >
                        (디버깅) 인증 건너뛰기
                    </button>
                )}
            </div>

        </div>
    );
}
