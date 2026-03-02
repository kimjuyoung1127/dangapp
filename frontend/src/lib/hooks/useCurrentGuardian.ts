// useCurrentGuardian.ts — 현재 로그인한 guardian 프로필 + dogs 조회 훅 (DANG-MAT-001)

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useCurrentGuardian() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["current-guardian"],
        queryFn: async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from("guardians")
                .select("*, dogs(*)")
                .eq("user_id", user.id)
                .single();

            if (error) throw error;
            return data;
        },
        retry: false,
    });
}
