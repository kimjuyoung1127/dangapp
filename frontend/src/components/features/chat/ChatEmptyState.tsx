// ChatEmptyState.tsx — 채팅 목록 빈 상태 (DANG-CHT-001)
"use client";

import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { ScrollReveal } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";

export default function ChatEmptyState() {
    return (
        <ScrollReveal>
            <div className="rounded-[1.9rem] border border-white/80 bg-white/88 px-6 py-12 text-center shadow-[0_18px_38px_-28px_rgba(17,49,85,0.22)] backdrop-blur-xl">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50">
                    <MessageSquareText className="w-8 h-8 text-foreground-muted" />
                </div>
                <h3 className="mb-1 text-lg font-semibold text-foreground">
                    아직 진행 중인 대화가 없어요
                </h3>
                <p className="mb-6 text-sm text-foreground-muted">
                    홈에서 마음이 맞는 보호자를 찾아보세요!
                </p>
                <Link href="/home">
                    <Button variant="outline" size="sm">
                        보호자 찾기
                    </Button>
                </Link>
            </div>
        </ScrollReveal>
    );
}
