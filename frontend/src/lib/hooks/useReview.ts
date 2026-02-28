// useReview.ts — 후기 CRUD 훅 (TanStack Query + Supabase)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type Review = Database["public"]["Tables"]["reviews"]["Row"];
type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];

/** 특정 보호자가 받은 후기 목록 */
export function useReviews(targetId: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["reviews", targetId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("reviews")
                .select("*")
                .eq("target_id", targetId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return (data || []) as Review[];
        },
        enabled: !!targetId,
    });
}

/** 내가 작성한 후기 목록 */
export function useMyReviews(authorId: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["my-reviews", authorId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("reviews")
                .select("*")
                .eq("author_id", authorId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return (data || []) as Review[];
        },
        enabled: !!authorId,
    });
}

/** 후기 작성 mutation */
export function useCreateReview() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: ReviewInsert) => {
            const { data, error } = await supabase
                .from("reviews")
                .insert(input)
                .select()
                .single();

            if (error) throw error;
            return data as Review;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["reviews", variables.target_id],
            });
            queryClient.invalidateQueries({
                queryKey: ["my-reviews", variables.author_id],
            });
            // 프로필 관련 캐시도 갱신
            queryClient.invalidateQueries({
                queryKey: ["guardian-profile", variables.target_id],
            });
        },
    });
}
