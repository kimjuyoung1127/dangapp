// useOnboardingStore.ts — 온보딩 멀티스텝 전역 상태 (DANG-ONB-001)

import { create } from 'zustand';
import { dogApi } from '@/lib/api/dog';
import { mapOnboardingToDog, mapOnboardingToGuardian } from '@/lib/utils/mappers';

export type OnboardingData = {
    // Guardian Data
    full_name?: string;
    nickname?: string;
    phone_number?: string;
    is_phone_verified?: boolean;
    birth_date?: string;
    gender?: 'male' | 'female' | 'other';
    bio?: string;
    avatar_url?: string;
    usage_purpose?: Array<'friend' | 'care' | 'family'>;

    // Dog Data
    dog_name?: string;
    dog_breed?: string;
    dog_birth_date?: string;
    dog_age?: number;
    dog_weight_kg?: number;
    dog_gender?: 'male' | 'female';
    dog_neutered?: boolean;
    dog_temperament?: string[];
    dog_temperament_profile?: {
        energy?: 'low' | 'mid' | 'high';
        sociability?: 'low' | 'mid' | 'high';
        stability?: 'low' | 'mid' | 'high';
        playfulness?: 'low' | 'mid' | 'high';
        protectiveness?: 'low' | 'mid' | 'high';
    };
    dog_photo_url?: string;
    dog_document_urls?: string[];

    // Match Preferences
    address_name?: string;
    verified_region?: boolean;
    weekday_activity_times?: Array<'morning' | 'afternoon' | 'evening'>;
    weekend_activity_times?: Array<'morning' | 'afternoon' | 'evening'>;
    preferred_radius_km?: number;
};

interface OnboardingState {
    step: number;
    maxStep: number;
    data: OnboardingData;
    isSubmitting: boolean;
    submitError: string | null;
    photoFile: File | null;
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    setData: (partial: Partial<OnboardingData>) => void;
    setSubmitting: (v: boolean) => void;
    setSubmitError: (msg: string | null) => void;
    setPhotoFile: (file: File | null) => void;
    submitOnboarding: () => Promise<void>;
    completionScore: () => number;
    canExplore: () => boolean;
    reset: () => void;
}

const COMPLETION_FIELDS: Array<keyof OnboardingData> = [
    'full_name',
    'nickname',
    'phone_number',
    'birth_date',
    'gender',
    'usage_purpose',
    'bio',
    'dog_name',
    'dog_breed',
    'dog_birth_date',
    'dog_age',
    'dog_weight_kg',
    'dog_gender',
    'dog_neutered',
    'dog_temperament',
    'dog_photo_url',
    'address_name',
    'verified_region',
    'preferred_radius_km',
    'weekday_activity_times',
    'weekend_activity_times',
];

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
    step: 1,
    maxStep: 8,
    data: {},
    isSubmitting: false,
    submitError: null,
    photoFile: null,
    setStep: (step: number) => set({ step }),
    nextStep: () => set((state) => ({ step: Math.min(state.step + 1, state.maxStep) })),
    prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
    setData: (partial) => set((state) => ({ data: { ...state.data, ...partial } })),
    setSubmitting: (v) => set({ isSubmitting: v }),
    setSubmitError: (msg) => set({ submitError: msg }),
    setPhotoFile: (file) => set({ photoFile: file }),

    submitOnboarding: async () => {
        const { data, photoFile, setSubmitting, setSubmitError } = get();
        setSubmitting(true);
        setSubmitError(null);

        try {
            let finalPhotoUrl = data.dog_photo_url;

            // 1. 사진 파일 업로드 (디버깅 시 파일이 없으면 스킵)
            if (photoFile) {
                try {
                    finalPhotoUrl = await dogApi.uploadPhoto(photoFile, 'dogs');
                } catch (e) {
                    console.warn("Photo upload failed, continuing with placeholder", e);
                }
            }

            // 2. 데이터 변환
            const dogPayload = mapOnboardingToDog({ ...data, dog_photo_url: finalPhotoUrl });
            const guardianPayload = mapOnboardingToGuardian(data);

            // 3. API 호출 (인증 에러가 나더라도 개발 환경에선 성공한 것처럼 로그만 남김)
            try {
                await dogApi.createDogProfile(dogPayload, guardianPayload);
            } catch (error) {
                const apiError = error as Error;
                console.error("API Error during onboarding:", apiError.message);
                if (process.env.NODE_ENV === "production") {
                    throw error; // 운영 환경에서만 에러 던짐
                }
                console.log("Development mode: Proceeding to home despite API error.");
            }
        } catch (error) {
            const err = error as Error;
            const message = err.message || '가입 정보 저장 중 오류가 발생했습니다.';
            setSubmitError(message);
            throw error;
        } finally {
            setSubmitting(false);
        }
    },


    completionScore: (): number => {
        const state = get().data;
        const filled = COMPLETION_FIELDS.filter((key) => {
            const value = state[key];
            if (Array.isArray(value)) return value.length > 0;
            return value !== undefined && value !== null && value !== '';
        }).length;

        return Math.round((filled / COMPLETION_FIELDS.length) * 100);
    },
    canExplore: (): boolean => {
        const state = get().data;
        return Boolean(state.nickname && state.dog_name && state.address_name);
    },
    reset: () => set({ step: 1, data: {}, isSubmitting: false, submitError: null, photoFile: null }),
}));
