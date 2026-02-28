"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
    const router = useRouter();

    const handleKakaoLogin = () => {
        // [개발자 모드] 실제 카우 인증 전 임시로 대시보드 이동
        console.log("Kakao login (dev mode) - Redirecting to /home");
        router.push("/home");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
            <div className="w-full max-w-sm space-y-8 bg-card p-8 rounded-3xl shadow-sm border border-border">
                <div className="text-center">
                    <h1 className="text-3xl font-display font-bold text-primary">DangGeting</h1>
                    <p className="mt-2 text-foreground-muted text-sm">신뢰 기반 반려견 매칭</p>
                </div>

                <form className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">이메일로 계속하기</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            className="w-full px-4 h-12 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                    </div>
                    <Button type="submit" size="lg" className="w-full">
                        Magic Link 받기
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-foreground-muted">또는</span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleKakaoLogin}
                >
                    카카오로 3초만에 시작
                </Button>

                <p className="text-center text-xs text-foreground-muted mt-4">
                    계정이 없으신가요? <Link href="/register" className="text-primary hover:underline font-medium">회원가입</Link>
                </p>
            </div>
        </div>
    );
}
