import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
            <div className="w-full max-w-sm space-y-8 bg-card p-8 rounded-3xl shadow-sm border border-border">
                <div className="text-center">
                    <h1 className="text-3xl font-display font-bold text-primary">회원가입</h1>
                    <p className="mt-2 text-foreground-muted text-sm">댕게팅에 오신 것을 환영합니다</p>
                </div>

                <form className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">이메일</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            className="w-full px-4 h-12 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                    </div>
                    <Button type="submit" size="lg" className="w-full">
                        인증 링크 발송 (Magic Link)
                    </Button>
                </form>

                <p className="text-center text-xs text-foreground-muted mt-4">
                    이미 계정이 있으신가요? <Link href="/login" className="text-primary hover:underline font-medium">로그인</Link>
                </p>
            </div>
        </div>
    );
}
