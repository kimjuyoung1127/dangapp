// useWalkRecord.ts — 산책 기록 CRUD 훅 (DANG-WLK-001)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type WalkRecord = Database["public"]["Tables"]["walk_records"]["Row"];
type WalkRecordInsert = Database["public"]["Tables"]["walk_records"]["Insert"];

/** 내가 작성한 산책 기록 목록 */
export function useWalkRecords(authorId: string | undefined) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["walk-records", authorId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("walk_records")
                .select("*")
                .eq("author_id", authorId!)
                .order("walk_date", { ascending: false });

            if (error) throw error;
            return (data || []) as WalkRecord[];
        },
        enabled: !!authorId,
    });
}

/** 산책 기록 단건 조회 */
export function useWalkRecord(id: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["walk-record", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("walk_records")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            return data as WalkRecord;
        },
        enabled: !!id,
    });
}

/** 산책 기록 작성 mutation */
export function useCreateWalkRecord() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: WalkRecordInsert) => {
            const { data, error } = await supabase
                .from("walk_records")
                .insert(input)
                .select()
                .single();

            if (error) throw error;
            return data as WalkRecord;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["walk-records"] });
        },
    });
}

/** walk-records 버킷 이미지 업로드 */
export function useUploadWalkPhoto() {
    const supabase = createClient();

    return useMutation({
        mutationFn: async (file: File) => {
            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
            const filePath = `walk-photos/${fileName}`;

            const { error } = await supabase.storage
                .from("walk-records")
                .upload(filePath, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from("walk-records")
                .getPublicUrl(filePath);

            return urlData.publicUrl;
        },
    });
}
