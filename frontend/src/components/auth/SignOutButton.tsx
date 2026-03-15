"use client";

import { useMemo, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
    className?: string;
    compact?: boolean;
}

export function SignOutButton({ className, compact = false }: SignOutButtonProps) {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const [isPending, setIsPending] = useState(false);

    const handleSignOut = async () => {
        if (isPending) return;

        try {
            setIsPending(true);
            await supabase.auth.signOut();

            startTransition(() => {
                router.replace("/login");
            });

            window.location.assign("/login");
        } catch (error) {
            console.error("Sign out error:", error);
            alert("로그아웃 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
            setIsPending(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleSignOut}
            disabled={isPending}
            className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-full border border-white/80 bg-white/80 text-sky-700 shadow-[0_14px_28px_-22px_rgba(17,49,85,0.24)] transition-colors hover:bg-sky-50 disabled:opacity-60",
                compact ? "h-9 px-3 text-xs font-semibold" : "h-10 px-3.5 text-sm font-medium",
                className
            )}
            aria-label="로그아웃"
        >
            <LogOut className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
            <span>{isPending ? "정리 중..." : "로그아웃"}</span>
        </button>
    );
}
