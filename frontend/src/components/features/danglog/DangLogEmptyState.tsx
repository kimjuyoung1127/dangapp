// DangLogEmptyState.tsx — 댕로그 빈 상태 안내 (DANG-DLG-001)

"use client";

import { ScrollReveal } from "@/components/ui/MotionWrappers";
import { Button } from "@/components/ui/Button";
import { BookOpen } from "lucide-react";

interface DangLogEmptyStateProps {
    onCreateClick: () => void;
}

export default function DangLogEmptyState({ onCreateClick }: DangLogEmptyStateProps) {
    return (
        <ScrollReveal>
            <div className="flex flex-col items-center justify-center mt-20 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary-light/20 flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <div className="text-center space-y-1">
                    <p className="font-medium text-lg text-foreground">
                        아직 기록이 없어요.
                    </p>
                    <p className="text-sm text-foreground-muted">
                        첫 댕로그를 작성해보세요!
                    </p>
                </div>
                <Button onClick={onCreateClick}>
                    댕로그 작성하기
                </Button>
            </div>
        </ScrollReveal>
    );
}
