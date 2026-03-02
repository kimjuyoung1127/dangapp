// onboarding.ts — 온보딩 스텝별 Zod 검증 스키마 (DANG-ONB-001)

import { z } from 'zod';

// Step 1: Guardian info — nickname 필수
export const step1Schema = z.object({
    nickname: z.string().min(1, '닉네임을 입력해주세요'),
    full_name: z.string().optional(),
    birth_date: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    usage_purpose: z.array(z.enum(['friend', 'care', 'family'])).optional(),
    bio: z.string().optional(),
});
export type Step1Data = z.infer<typeof step1Schema>;

// Step 2: Dog info — dog_name 필수
export const step2Schema = z.object({
    dog_name: z.string().min(1, '반려견 이름을 입력해주세요'),
    dog_breed: z.string().optional(),
    dog_birth_date: z.string().optional(),
    dog_weight_kg: z.number().optional(),
    dog_gender: z.enum(['male', 'female']).optional(),
    dog_neutered: z.boolean().optional(),
});
export type Step2Data = z.infer<typeof step2Schema>;

// Step 3: Dog age — 전체 선택
export const step3Schema = z.object({
    dog_age: z.number().optional(),
});
export type Step3Data = z.infer<typeof step3Schema>;

// Step 4: Dog temperament — 전체 선택
export const step4Schema = z.object({
    dog_temperament: z.array(z.string()).max(3).optional(),
});
export type Step4Data = z.infer<typeof step4Schema>;

// Step 5: Dog photo — 전체 선택
export const step5Schema = z.object({
    dog_photo_url: z.string().optional(),
});
export type Step5Data = z.infer<typeof step5Schema>;

// Step 6: Location — address_name 필수
export const step6Schema = z.object({
    address_name: z.string().min(1, '산책 지역을 입력해주세요'),
    verified_region: z.boolean().optional(),
    preferred_radius_km: z.number().optional(),
});
export type Step6Data = z.infer<typeof step6Schema>;

// Step 7: Activity times — 전체 선택
export const step7Schema = z.object({
    weekday_activity_times: z.array(z.enum(['morning', 'afternoon', 'evening'])).optional(),
    weekend_activity_times: z.array(z.enum(['morning', 'afternoon', 'evening'])).optional(),
});
export type Step7Data = z.infer<typeof step7Schema>;

// 통합 스키마
export const onboardingFullSchema = step1Schema
    .merge(step2Schema)
    .merge(step3Schema)
    .merge(step4Schema)
    .merge(step5Schema)
    .merge(step6Schema)
    .merge(step7Schema);

export type OnboardingFullData = z.infer<typeof onboardingFullSchema>;
