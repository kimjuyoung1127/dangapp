// dog.ts — 반려견 및 보호자 프로필 데이터 영속성 (DANG-ONB-001)

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

const supabase = createClient();

type DogInsert = Database['public']['Tables']['dogs']['Insert'];
type GuardianUpdate = Database['public']['Tables']['guardians']['Update'];

export const dogApi = {
  /**
   * 반려견 프로필 생성 및 보호자 온보딩 상태 업데이트
   */
  async createDogProfile(dogData: DogInsert, guardianData: GuardianUpdate) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('인증된 사용자가 아닙니다.');

    // 1. 보호자 정보 업서트 (존재하면 업데이트, 없으면 생성)
    // user_id를 기반으로 업서트 수행
    const { data: guardian, error: guardianError } = await supabase
      .from('guardians')
      .upsert({
        ...guardianData,
        user_id: user.id,
        onboarding_progress: 100, // 온보딩 완료
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (guardianError) throw guardianError;

    // 2. 강아지 프로필 생성 (위에서 조회한 실제 guardian.id 사용)
    const { data: dog, error: dogError } = await supabase
      .from('dogs')
      .insert({
        ...dogData,
        guardian_id: guardian.id, 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dogError) throw dogError;

    return dog;
  },


  /**
   * 사진 업로드 (강아지/보호자)
   */
  async uploadPhoto(file: File, bucket: 'dogs' | 'avatars') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  }
};
