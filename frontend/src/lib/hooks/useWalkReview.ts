// useWalkReview.ts — 산책 후기 CRUD 훅 (DANG-WLK-001)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type WalkReview = Database["public"]["Tables"]["walk_reviews"]["Row"];
type WalkReviewInsert = Database["public"]["Tables"]["walk_reviews"]["Insert"];

/** 특정 보호자가 받은 산책 후기 목록 */
export function useWalkReviews(targetId: string | undefined) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["walk-reviews", targetId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("walk_reviews")
                .select("*")
                .eq("target_id", targetId!)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return (data || []) as WalkReview[];
        },
        enabled: !!targetId,
    });
}

/** 산책 후기 작성 mutation */
export function useCreateWalkReview() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: WalkReviewInsert) => {
            const { data, error } = await supabase
                .from("walk_reviews")
                .insert(input)
                .select()
                .single();

            if (error) throw error;
            return data as WalkReview;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["walk-reviews", variables.target_id],
            });
        },
    });
}
