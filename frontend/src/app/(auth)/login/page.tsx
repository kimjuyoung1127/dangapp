"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const handleSocialLogin = async (provider: "kakao" | "google") => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error(`${provider} login error:`, error.message);
            alert("로그인 중 오류가 발생했습니다.");
        }
    };


    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
            <div className="w-full max-w-sm space-y-16 text-center">
                {/* 브랜드 로고 섹션 */}
                <div className="space-y-4 flex flex-col items-center">
                    <div className="relative w-48 h-20 animate-in zoom-in-50 duration-500">
                        <Image
                            src="/logo.svg"
                            alt="댕게팅"
                            fill
                            priority
                            className="object-contain"
                        />
                    </div>
                    <p className="text-foreground-muted text-sm font-medium tracking-tight">우리 아이의 소중한 산책 친구</p>
                </div>

                {/* 간편 인증 섹션 */}

                <div className="space-y-3 pt-4">
                    <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-[0.2em] mb-6">간편 로그인</p>
                    
                    {/* 카카오 로그인 - 피드백 반영: 채도를 낮추고 부드러운 노란색 적용 */}
                    <button
                        onClick={() => handleSocialLogin("kakao")}
                        className="w-full h-14 bg-[#FEE500] hover:bg-[#F9DB00] active:bg-[#F2D000] text-[#191919] rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all active:scale-[0.98] shadow-sm"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3C6.477 3 2 6.48 2 10.8c0 2.76 1.845 5.205 4.635 6.645l-.945 3.465c-.075.285.105.57.39.465l4.08-2.715c.615.09 1.245.135 1.89.135 5.523 0 10-3.48 10-7.8S17.523 3 12 3z" />
                        </svg>
                        카카오로 시작하기
                    </button>

                    {/* 구글 로그인 */}
                    <button
                        onClick={() => handleSocialLogin("google")}
                        className="w-full h-14 bg-white text-foreground border border-border rounded-2xl flex items-center justify-center gap-3 font-bold text-lg hover:bg-accent transition-all active:scale-[0.98] shadow-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google로 시작하기
                    </button>
                </div>

                <div className="pt-8">
                    <p className="text-xs text-foreground-muted leading-relaxed">
                        계속 진행하면 댕게팅의 <br />
                        <span className="underline cursor-pointer">이용약관</span> 및 <span className="underline cursor-pointer">개인정보 처리방침</span>에 동의하게 됩니다.
                    </p>
                </div>
            </div>
        </div>
    );
}


