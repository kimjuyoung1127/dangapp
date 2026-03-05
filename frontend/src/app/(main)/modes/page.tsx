"use client";

import { useMemo, useState } from "react";
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

    const unlockedModes = useMemo(() => {
        const set = new Set(unlocks.map((unlock) => unlock.mode));
        set.add("basic");
        return set;
    }, [unlocks]);

    const isModeUnlocked = (config: ModeConfig) => {
        if (config.mode === "basic") return true;
        return unlockedModes.has(config.mode) || trustLevel >= config.requiredLevel;
    };

    const handleSelect = (config: ModeConfig) => {
        const unlocked = isModeUnlocked(config);

        if (!unlocked) {
            setLockedMode(config);
            return;
        }

        setActiveMode(config.mode);

        if (config.mode === "care") {
            void router.push("/care");
            return;
        }

        if (config.mode === "family") {
            void router.push("/family");
        }
    };

    return (
        <AppShell>
            <div className="px-4 py-6 space-y-6">
                <h1 className="text-2xl font-display font-bold text-foreground">Mode selection</h1>

                <div className="space-y-4">
                    {MODE_CONFIG.map((config) => (
                        <ModeCard
                            key={config.mode}
                            config={config}
                            isUnlocked={isModeUnlocked(config)}
                            isActive={activeMode === config.mode}
                            currentLevel={trustLevel}
                            onSelect={() => handleSelect(config)}
                        />
                    ))}
                </div>
            </div>

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