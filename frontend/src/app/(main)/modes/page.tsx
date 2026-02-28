// modes/page.tsx — 모드 선택 허브 (Basic/Care/Family 카드)

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import ModeCard from "@/components/features/modes/ModeCard";
import ModeUnlockDialog from "@/components/features/modes/ModeUnlockDialog";
import { MODE_CONFIG, type ModeConfig } from "@/lib/constants/modes";

// 더미 데이터 (Supabase 연동 전 시각적 확인용)
const MOCK_TRUST_LEVEL = 2;
const MOCK_TRUST_SCORE = 35;
const MOCK_UNLOCKED: string[] = ["basic", "care"];

export default function ModesPage() {
    const router = useRouter();
    const [activeMode, setActiveMode] = useState<string>("basic");
    const [lockedMode, setLockedMode] = useState<ModeConfig | null>(null);

    const handleSelect = (config: ModeConfig) => {
        const isUnlocked = MOCK_UNLOCKED.includes(config.mode);

        if (!isUnlocked) {
            setLockedMode(config);
            return;
        }

        setActiveMode(config.mode);

        if (config.mode === "care") {
            router.push("/care");
        } else if (config.mode === "family") {
            router.push("/family");
        }
    };

    return (
        <AppShell>
            <div className="px-4 py-6 space-y-6">
                <h1 className="text-2xl font-display font-bold text-foreground">
                    모드 선택
                </h1>

                <div className="space-y-4">
                    {MODE_CONFIG.map((config) => (
                        <ModeCard
                            key={config.mode}
                            config={config}
                            isUnlocked={MOCK_UNLOCKED.includes(config.mode)}
                            isActive={activeMode === config.mode}
                            currentLevel={MOCK_TRUST_LEVEL}
                            onSelect={() => handleSelect(config)}
                        />
                    ))}
                </div>
            </div>

            {/* 잠금 해제 안내 다이얼로그 */}
            {lockedMode && (
                <ModeUnlockDialog
                    isOpen={!!lockedMode}
                    onClose={() => setLockedMode(null)}
                    config={lockedMode}
                    currentLevel={MOCK_TRUST_LEVEL}
                    currentScore={MOCK_TRUST_SCORE}
                />
            )}
        </AppShell>
    );
}
