// mappers.ts - map onboarding UI state to DB payloads (DANG-ONB-001)

import type { OnboardingData } from '@/stores/useOnboardingStore';
import type { Database, Json } from '@/types/database.types';

type DogInsert = Database['public']['Tables']['dogs']['Insert'];
type GuardianUpdate = Database['public']['Tables']['guardians']['Update'];
type DogWalkSlot = NonNullable<DogInsert['weekday_walk_slots']>[number];

const toUniqueTimeSlots = (
  weekday?: DogWalkSlot[],
  weekend?: DogWalkSlot[]
): DogWalkSlot[] => Array.from(new Set([...(weekday ?? []), ...(weekend ?? [])]));

/**
 * Maps OnboardingData to Supabase dogs Insert payload.
 */
export const mapOnboardingToDog = (data: OnboardingData): DogInsert => {
  return {
    guardian_id: '', // Filled by API layer using current guardian context.
    name: data.dog_name || 'Unknown',
    breed: data.dog_breed || 'Mixed',
    age: data.dog_age ?? null,
    birth_date: data.dog_birth_date ?? null,
    weight_kg: data.dog_weight_kg ?? null,
    gender: data.dog_gender ?? null,
    neutered: data.dog_neutered ?? null,
    temperament: (data.dog_temperament ?? []) as Json,
    temperament_profile: (data.dog_temperament_profile ?? {}) as Json,
    weekday_walk_slots: (data.weekday_activity_times ?? []) as DogWalkSlot[],
    weekend_walk_slots: (data.weekend_activity_times ?? []) as DogWalkSlot[],
    photo_urls: data.dog_photo_url ? [data.dog_photo_url] : [],
    vaccination_docs: data.dog_document_urls ?? [],
    documents: (data.dog_document_urls ?? []) as Json,
  };
};

/**
 * Maps OnboardingData to Supabase guardians Update payload.
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
    // location is applied via set_guardian_location RPC in API layer.
    verified_region: data.verified_region ?? false,
    usage_purpose: data.usage_purpose ?? [],
    preferred_radius_km: data.preferred_radius_km ?? 2,
    onboarding_progress: 100,
    activity_times: toUniqueTimeSlots(data.weekday_activity_times, data.weekend_activity_times) as Json,
  };
};
