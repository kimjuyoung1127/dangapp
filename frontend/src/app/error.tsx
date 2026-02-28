"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6 bg-background">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-error" />
            </div>
            <div className="space-y-2">
                <h1 className="text-2xl font-display font-bold text-foreground">문제가 발생했습니다</h1>
                <p className="text-foreground-muted max-w-xs mx-auto text-sm">
                    요청을 처리하는 중에 예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                </p>
            </div>
            <Button
                onClick={() => reset()}
                className="w-full max-w-xs rounded-xl"
            >
                다시 시도하기
            </Button>
        </div>
    );
}
