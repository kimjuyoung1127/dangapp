"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AppShell } from "@/components/shared/AppShell";
import { AlertTriangle } from "lucide-react";

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
        <AppShell>
            <div className="px-4 py-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-warning" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-xl font-display font-bold text-foreground">데이터를 불러오지 못했습니다</h1>
                    <p className="text-foreground-muted max-w-xs mx-auto text-sm">
                        현재 정보를 불러오는 중에 오류가 발생했습니다. {error.message ? `(${error.message})` : ""}
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => reset()}
                    className="w-full max-w-xs rounded-xl"
                >
                    새로고침
                </Button>
            </div>
        </AppShell>
    );
}
