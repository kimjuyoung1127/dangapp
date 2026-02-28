import { useQuery, useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useMatchingGuardians() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['matching-guardians'],
        queryFn: async () => {
            // 1. 현재 로그인한 내 정보 가져오기
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { data: myGuardian } = await supabase
                .from('guardians')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!myGuardian) throw new Error("Guardian profile not found");

            // 2. RPC 호출: 추천 보호자 리스트 가져오기 (10명)
            const { data: matchedIds, error: rpcError } = await supabase
                .rpc('match_guardians', {
                    p_guardian_id: myGuardian.id,
                    p_limit: 10,
                    p_offset: 0
                });

            if (rpcError) throw rpcError;

            if (!matchedIds || matchedIds.length === 0) return [];

            // 3. 매칭된 각 보호자의 상세 정보(guardians + dogs) Fetch
            // (현실적인 앱에선 RPC에서 join 쿼리를 통해 한 번에 가져오도록 최적화합니다. 여기선 간결성을 위해 분리)
            const guardianIds = matchedIds.map((m: { guardian_id: string }) => m.guardian_id);

            const { data: fullProfiles, error: fetchError } = await supabase
                .from('guardians')
                .select(`
          *,
          users ( trust_score, trust_level ),
          dogs ( * )
        `)
                .in('id', guardianIds);

            if (fetchError) throw fetchError;

            // RPC에서 계산된 거리(distance_meters)를 응답에 병합
            return fullProfiles.map(profile => {
                const matchInfo = matchedIds.find((m: { guardian_id: string; distance_meters: number; compatibility_score: number }) => m.guardian_id === profile.id);
                return {
                    ...profile,
                    distance_meters: matchInfo?.distance_meters,
                    compatibility_score: matchInfo?.compatibility_score
                };
            });
        },
    });
}

// 스와이프 액션 (Like / Pass) Mutation 훅
export function useCreateMatchAction() {
    const supabase = createClient();

    return useMutation({
        mutationFn: async ({
            from_guardian_id,
            to_guardian_id,
            action_type,    // 'like' | 'pass'
            liked_section,
            comment
        }: {
            from_guardian_id: string;
            to_guardian_id: string;
            action_type: 'like' | 'pass';
            liked_section?: string;
            comment?: string;
        }) => {

            if (action_type === 'pass') {
                // 패스 처리: 나중에 추천에서 제외하기 위해 매치 테이블에 rejected 상태로 넣을지, blocks로 넣을지.
                // 여기선 matches 테이블에 상태를 남깁니다.
                const { error } = await supabase
                    .from('matches')
                    .insert({
                        from_guardian_id,
                        to_guardian_id,
                        status: 'rejected'
                    });
                if (error) throw error;
            } else {
                // 좋아요 처리
                const { error } = await supabase
                    .from('matches')
                    .insert({
                        from_guardian_id,
                        to_guardian_id,
                        status: 'pending',
                        liked_section,
                        comment
                    });
                if (error) throw error;
            }
            return true;
        },
        onSuccess: () => {
            // 액션 후 추천 카드 리스트 무효화해서 새로고침 (다음 카드 보여주기 위함)
            // queryClient.invalidateQueries({ queryKey: ['matching-guardians'] });
        },
    });
}
