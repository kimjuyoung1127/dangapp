// useModeStore.ts — 모드 상태 관리 (Zustand)

import { create } from "zustand";

type ModeType = "basic" | "care" | "family";

interface ModeState {
    activeMode: ModeType;
    unlockedModes: ModeType[];
    setActiveMode: (mode: ModeType) => void;
    setUnlockedModes: (modes: ModeType[]) => void;
    isUnlocked: (mode: ModeType) => boolean;
}

export const useModeStore = create<ModeState>((set, get) => ({
    activeMode: "basic",
    unlockedModes: ["basic"],
    setActiveMode: (mode) => set({ activeMode: mode }),
    setUnlockedModes: (modes) => set({ unlockedModes: modes }),
    isUnlocked: (mode) => get().unlockedModes.includes(mode),
}));
