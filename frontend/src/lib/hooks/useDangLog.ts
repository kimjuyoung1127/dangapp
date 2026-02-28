import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type DangLog = Database["public"]["Tables"]["danglogs"]["Row"];
type DangLogInsert = Database["public"]["Tables"]["danglogs"]["Insert"];
type DangLogComment = Database["public"]["Tables"]["danglog_comments"]["Row"];
type DangLogCommentInsert = Database["public"]["Tables"]["danglog_comments"]["Insert"];
type DangLogLike = Database["public"]["Tables"]["danglog_likes"]["Row"];

// 댕로그 피드 목록 (내 기록 또는 전체)
export function useDangLogs(authorId?: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["danglogs", authorId ?? "all"],
        queryFn: async () => {
            let query = supabase
                .from("danglogs")
                .select("*")
                .order("created_at", { ascending: false });

            if (authorId) {
                query = query.eq("author_id", authorId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return (data || []) as DangLog[];
        },
    });
}

// 댕로그 단건 상세
export function useDangLog(id: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["danglog", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("danglogs")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            return data as DangLog;
        },
        enabled: !!id,
    });
}

// 댕로그 작성
export function useCreateDangLog() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: DangLogInsert) => {
            const { data, error } = await supabase
                .from("danglogs")
                .insert(input)
                .select()
                .single();

            if (error) throw error;
            return data as DangLog;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["danglogs"] });
        },
    });
}

// 댕로그 삭제
export function useDeleteDangLog() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("danglogs")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["danglogs"] });
        },
    });
}

// 댓글 목록
export function useDangLogComments(danglogId: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["danglog-comments", danglogId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("danglog_comments")
                .select("*")
                .eq("danglog_id", danglogId)
                .order("created_at", { ascending: true });

            if (error) throw error;
            return (data || []) as DangLogComment[];
        },
        enabled: !!danglogId,
    });
}

// 댓글 작성
export function useCreateComment() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: DangLogCommentInsert) => {
            const { data, error } = await supabase
                .from("danglog_comments")
                .insert(input)
                .select()
                .single();

            if (error) throw error;
            return data as DangLogComment;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["danglog-comments", variables.danglog_id],
            });
        },
    });
}

// 좋아요 목록 (특정 댕로그)
export function useDangLogLikes(danglogId: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["danglog-likes", danglogId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("danglog_likes")
                .select("*")
                .eq("danglog_id", danglogId);

            if (error) throw error;
            return (data || []) as DangLogLike[];
        },
        enabled: !!danglogId,
    });
}

// 좋아요 토글 (있으면 삭제, 없으면 추가)
export function useToggleLike() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            danglog_id,
            guardian_id,
        }: {
            danglog_id: string;
            guardian_id: string;
        }) => {
            // 기존 좋아요 확인
            const { data: existing } = await supabase
                .from("danglog_likes")
                .select("danglog_id")
                .eq("danglog_id", danglog_id)
                .eq("guardian_id", guardian_id)
                .maybeSingle();

            if (existing) {
                // 이미 좋아요 → 삭제
                const { error } = await supabase
                    .from("danglog_likes")
                    .delete()
                    .eq("danglog_id", danglog_id)
                    .eq("guardian_id", guardian_id);
                if (error) throw error;
                return { action: "unliked" as const };
            } else {
                // 좋아요 추가
                const { error } = await supabase
                    .from("danglog_likes")
                    .insert({ danglog_id, guardian_id });
                if (error) throw error;
                return { action: "liked" as const };
            }
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["danglog-likes", variables.danglog_id],
            });
        },
    });
}

// Supabase Storage 이미지 업로드
export function useUploadDangLogImage() {
    const supabase = createClient();

    return useMutation({
        mutationFn: async (file: File) => {
            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
            const filePath = `danglog-images/${fileName}`;

            const { error } = await supabase.storage
                .from("danglog-images")
                .upload(filePath, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from("danglog-images")
                .getPublicUrl(filePath);

            return urlData.publicUrl;
        },
    });
}
