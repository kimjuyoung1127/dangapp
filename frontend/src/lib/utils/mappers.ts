// mappers.ts — UI 상태와 DB 스키마 간의 변환 (DANG-ONB-001)

import type { OnboardingData } from '@/stores/useOnboardingStore';
import type { Database } from '@/types/database.types';

type DogInsert = Database['public']['Tables']['dogs']['Insert'];
type GuardianUpdate = Database['public']['Tables']['guardians']['Update'];

/**
 * OnboardingData를 Supabase의 dogs 테이블 Insert 타입으로 변환
 */
export const mapOnboardingToDog = (data: OnboardingData): DogInsert => {
  return {
    guardian_id: '', // API 호출부에서 실제 ID로 채워짐
    name: data.dog_name || '이름 없음',
    breed: data.dog_breed || '믹스견',
    age: data.dog_age ?? null,
    birth_date: data.dog_birth_date ?? null,
    weight_kg: data.dog_weight_kg ?? null,
    gender: data.dog_gender ?? null,
    neutered: data.dog_neutered ?? null,
    temperament: (data.dog_temperament || []) as any, 
    temperament_profile: (data.dog_temperament_profile || {}) as any,
    weekday_walk_slots: (data.weekday_activity_times || []) as any,
    weekend_walk_slots: (data.weekend_activity_times || []) as any,
    photo_urls: data.dog_photo_url ? [data.dog_photo_url] : [],
    vaccination_docs: data.dog_document_urls || [],
    documents: null,
  };
};

/**
 * OnboardingData를 Supabase의 guardians 테이블 Update 타입으로 변환
 */
export const mapOnboardingToGuardian = (data: OnboardingData): GuardianUpdate => {
  return {
    nickname: data.nickname || '',
    full_name: data.full_name ?? null,
    birth_date: data.birth_date ?? null,
    gender: data.gender ?? null,
    avatar_url: data.avatar_url ?? null,
    bio: data.bio ?? null,
    address_name: data.address_name ?? null,
    verified_region: data.verified_region ?? false,
    usage_purpose: (data.usage_purpose || []) as any,
    preferred_radius_km: data.preferred_radius_km ?? 2,
    activity_times: {
      weekday: data.weekday_activity_times || [],
      weekend: data.weekend_activity_times || [],
    } as any,
    phone_number: data.phone_number, 
  };
};



