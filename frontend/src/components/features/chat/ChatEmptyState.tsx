// ChatEmptyState.tsx — 채팅 목록 빈 상태 (DANG-CHT-001)
"use client";

import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { ScrollReveal } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";

export default function ChatEmptyState() {
    return (
        <ScrollReveal>
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <MessageSquareText className="w-8 h-8 text-foreground-muted" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                    아직 진행 중인 대화가 없어요
                </h3>
                <p className="text-sm text-foreground-muted mb-6">
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
