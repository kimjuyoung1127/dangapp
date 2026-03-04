// modes/page.tsx — 모드 선택 허브 (Basic/Care/Family 카드) (DANG-MAT-001)

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import ModeCard from "@/components/features/modes/ModeCard";
import ModeUnlockDialog from "@/components/features/modes/ModeUnlockDialog";
import { MODE_CONFIG, type ModeConfig } from "@/lib/constants/modes";
import { useModeUnlocks } from "@/lib/hooks/useMode";
import { useCurrentGuardian } from "@/lib/hooks/useCurrentGuardian";

export default function ModesPage() {
    const router = useRouter();
    const [activeMode, setActiveMode] = useState<string>("basic");
    const [lockedMode, setLockedMode] = useState<ModeConfig | null>(null);

    const { data: guardian } = useCurrentGuardian();
    const guardianId = guardian?.id ?? "";
    const trustLevel = guardian?.trust_level ?? 0;
    const trustScore = guardian?.trust_score ?? 0;

    const { data: unlocks = [] } = useModeUnlocks(guardianId);
    const unlockedModes = new Set(unlocks.map((u) => u.mode));
    // basic 모드는 항상 해제
    unlockedModes.add("basic");

    const handleSelect = (config: ModeConfig) => {
        const isUnlocked = unlockedModes.has(config.mode);

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
                            isUnlocked={unlockedModes.has(config.mode)}
                            isActive={activeMode === config.mode}
                            currentLevel={trustLevel}
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
                    currentLevel={trustLevel}
                    currentScore={trustScore}
                />
            )}
        </AppShell>
    );
}
