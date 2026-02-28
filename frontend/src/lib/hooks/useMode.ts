// useMode.ts — 모드 잠금/해제 + 돌봄 요청 + 패밀리 그룹 훅

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type ModeUnlock = Database["public"]["Tables"]["mode_unlocks"]["Row"];
type ModeUnlockInsert = Database["public"]["Tables"]["mode_unlocks"]["Insert"];
type CareRequest = Database["public"]["Tables"]["care_requests"]["Row"];
type CareRequestInsert = Database["public"]["Tables"]["care_requests"]["Insert"];
type FamilyGroup = Database["public"]["Tables"]["family_groups"]["Row"];
type FamilyGroupInsert = Database["public"]["Tables"]["family_groups"]["Insert"];
type FamilyMember = Database["public"]["Tables"]["family_members"]["Row"];
type FamilyMemberInsert = Database["public"]["Tables"]["family_members"]["Insert"];

// ─── 모드 잠금/해제 ─────────────────────────────

/** 잠금 해제된 모드 목록 */
export function useModeUnlocks(guardianId: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["mode-unlocks", guardianId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("mode_unlocks")
                .select("*")
                .eq("guardian_id", guardianId);

            if (error) throw error;
            return (data || []) as ModeUnlock[];
        },
        enabled: !!guardianId,
    });
}

/** 모드 잠금 해제 mutation */
export function useUnlockMode() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: ModeUnlockInsert) => {
            const { data, error } = await supabase
                .from("mode_unlocks")
                .insert(input)
                .select()
                .single();

            if (error) throw error;
            return data as ModeUnlock;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["mode-unlocks", variables.guardian_id],
            });
        },
    });
}

// ─── 돌봄 요청 ─────────────────────────────

/** 보낸/받은 돌봄 요청 목록 */
export function useCareRequests(guardianId: string, type: "sent" | "received") {
    const supabase = createClient();

    return useQuery({
        queryKey: ["care-requests", guardianId, type],
        queryFn: async () => {
            const column = type === "sent" ? "requester_id" : "caregiver_id";
            const { data, error } = await supabase
                .from("care_requests")
                .select("*")
                .eq(column, guardianId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return (data || []) as CareRequest[];
        },
        enabled: !!guardianId,
    });
}

/** 돌봄 요청 작성 */
export function useCreateCareRequest() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CareRequestInsert) => {
            const { data, error } = await supabase
                .from("care_requests")
                .insert(input)
                .select()
                .single();

            if (error) throw error;
            return data as CareRequest;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["care-requests", variables.requester_id],
            });
        },
    });
}

/** 돌봄 요청 상태 변경 (수락/완료/취소) */
export function useUpdateCareRequest() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            status,
        }: {
            id: string;
            status: "accepted" | "completed" | "cancelled";
        }) => {
            const { error } = await supabase
                .from("care_requests")
                .update({ status, updated_at: new Date().toISOString() })
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["care-requests"] });
        },
    });
}

// ─── 패밀리 그룹 ─────────────────────────────

/** 소속 그룹 목록 */
export function useFamilyGroups(guardianId: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["family-groups", guardianId],
        queryFn: async () => {
            const { data: memberRows, error: memberError } = await supabase
                .from("family_members")
                .select("group_id")
                .eq("member_id", guardianId);

            if (memberError) throw memberError;

            const groupIds = (memberRows || []).map((r) => r.group_id);
            if (groupIds.length === 0) return [] as FamilyGroup[];

            const { data, error } = await supabase
                .from("family_groups")
                .select("*")
                .in("id", groupIds)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return (data || []) as FamilyGroup[];
        },
        enabled: !!guardianId,
    });
}

/** 그룹 생성 (+ owner 멤버 자동 추가) */
export function useCreateFamilyGroup() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: FamilyGroupInsert) => {
            const { data, error } = await supabase
                .from("family_groups")
                .insert(input)
                .select()
                .single();

            if (error) throw error;
            const group = data as FamilyGroup;

            // 생성자를 owner로 추가
            await supabase.from("family_members").insert({
                group_id: group.id,
                member_id: input.creator_id,
                role: "owner",
            });

            return group;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["family-groups", variables.creator_id],
            });
        },
    });
}

/** 멤버 초대 */
export function useAddFamilyMember() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: FamilyMemberInsert) => {
            const { data, error } = await supabase
                .from("family_members")
                .insert(input)
                .select()
                .single();

            if (error) throw error;
            return data as FamilyMember;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["family-groups"],
            });
            queryClient.invalidateQueries({
                queryKey: ["family-members", variables.group_id],
            });
        },
    });
}

/** 그룹 멤버 목록 */
export function useFamilyMembers(groupId: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["family-members", groupId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("family_members")
                .select("*")
                .eq("group_id", groupId)
                .order("joined_at", { ascending: true });

            if (error) throw error;
            return (data || []) as FamilyMember[];
        },
        enabled: !!groupId,
    });
}
