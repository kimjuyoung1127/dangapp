// useOnboarding.ts — 온보딩 Supabase 영속화 훅 (DANG-ONB-001)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { OnboardingData } from "@/stores/useOnboardingStore";

/** 기존 가디언 프로필 존재 여부 확인 (이미 온보딩 완료 시 /home 리다이렉트용) */
export function useExistingGuardian() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["existing-guardian"],
        queryFn: async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return null;

            const { data } = await supabase
                .from("guardians")
                .select("id")
                .eq("user_id", user.id)
                .single();

            return data;
        },
        retry: false,
    });
}

/** 반려견 사진 업로드 (Step5 즉시 업로드) */
export function useUploadDogPhoto() {
    const supabase = createClient();

    return useMutation({
        mutationFn: async (file: File) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("인증이 필요합니다");

            const ext = file.name.split(".").pop() || "jpg";
            const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from("dog-profiles")
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const {
                data: { publicUrl },
            } = supabase.storage.from("dog-profiles").getPublicUrl(filePath);

            return publicUrl;
        },
    });
}

/** 온보딩 최종 제출 — guardian + dog + consent_logs INSERT */
export function useCompleteOnboarding() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            data,
            photoFile,
        }: {
            data: OnboardingData;
            photoFile: File | null;
        }) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");

            // 1. 사진 업로드 (photoFile이 있고 아직 URL이 없는 경우)
            let photoUrl = data.dog_photo_url;
            if (photoFile && !photoUrl) {
                const ext = photoFile.name.split(".").pop() || "jpg";
                const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

                const { error: uploadError } = await supabase.storage
                    .from("dog-profiles")
                    .upload(filePath, photoFile, { upsert: true });

                if (uploadError) throw uploadError;

                const {
                    data: { publicUrl },
                } = supabase.storage.from("dog-profiles").getPublicUrl(filePath);
                photoUrl = publicUrl;
            }

            // 2. completionScore 계산
            const filledCount = [
                data.full_name,
                data.nickname,
                data.birth_date,
                data.gender,
                data.usage_purpose?.length,
                data.bio,
                data.dog_name,
                data.dog_breed,
                data.dog_birth_date,
                data.dog_age,
                data.dog_weight_kg,
                data.dog_gender,
                data.dog_neutered !== undefined ? "yes" : undefined,
                data.dog_temperament?.length,
                photoUrl,
                data.address_name,
                data.verified_region !== undefined ? "yes" : undefined,
                data.preferred_radius_km,
                data.weekday_activity_times?.length,
                data.weekend_activity_times?.length,
            ].filter(Boolean).length;
            const onboardingProgress = Math.round((filledCount / 20) * 100);

            // 3. Guardian INSERT
            const { data: guardian, error: guardianError } = await supabase
                .from("guardians")
                .insert({
                    user_id: user.id,
                    nickname: data.nickname!,
                    full_name: data.full_name || null,
                    birth_date: data.birth_date || null,
                    gender: data.gender || null,
                    bio: data.bio || null,
                    usage_purpose: data.usage_purpose || ["friend"],
                    address_name: data.address_name || null,
                    verified_region: data.verified_region ?? false,
                    preferred_radius_km: data.preferred_radius_km ?? 3,
                    activity_times: {
                        weekday: data.weekday_activity_times || [],
                        weekend: data.weekend_activity_times || [],
                    },
                    onboarding_progress: onboardingProgress,
                })
                .select("id")
                .single();

            if (guardianError) throw guardianError;

            // 4. Dog INSERT
            const { error: dogError } = await supabase.from("dogs").insert({
                guardian_id: guardian.id,
                name: data.dog_name!,
                breed: data.dog_breed || "미정",
                age: data.dog_age ?? null,
                birth_date: data.dog_birth_date || null,
                weight_kg: data.dog_weight_kg ?? null,
                gender: data.dog_gender || null,
                neutered: data.dog_neutered ?? null,
                temperament: data.dog_temperament || [],
                photo_urls: photoUrl ? [photoUrl] : [],
                weekday_walk_slots: data.weekday_activity_times || [],
                weekend_walk_slots: data.weekend_activity_times || [],
            });

            if (dogError) throw dogError;

            // 5. Consent logs INSERT (privacy + terms)
            const consentEntries = [
                { user_id: user.id, consent_type: "privacy" as const, consented: true, policy_version: "1.0" },
                { user_id: user.id, consent_type: "terms" as const, consented: true, policy_version: "1.0" },
            ];

            const { error: consentError } = await supabase
                .from("consent_logs")
                .insert(consentEntries);

            if (consentError) throw consentError;

            return { guardianId: guardian.id };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["existing-guardian"] });
            queryClient.invalidateQueries({ queryKey: ["guardian-profile"] });
        },
    });
}
