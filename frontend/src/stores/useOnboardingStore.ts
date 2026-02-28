import { create } from 'zustand';

export type OnboardingData = {
    // Guardian (User) Data
    nickname?: string;
    bio?: string;
    avatar_url?: string;

    // Dog Data
    dog_name?: string;
    dog_breed?: string;
    dog_age?: number;
    dog_temperament?: string[]; // e.g., ['active', 'friendly']
    dog_photo_url?: string;

    // Match Preferences
    address_name?: string;
    activity_times?: string[];
    preferred_radius_km?: number;
};

interface OnboardingState {
    step: number;
    maxStep: number;
    data: OnboardingData;
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    setData: (partial: Partial<OnboardingData>) => void;
    reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
    step: 1,
    maxStep: 7,
    data: {},
    setStep: (step: number) => set({ step }),
    nextStep: () => set((state) => ({ step: Math.min(state.step + 1, state.maxStep) })),
    prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
    setData: (partial) => set((state) => ({ data: { ...state.data, ...partial } })),
    reset: () => set({ step: 1, data: {} }),
}));
