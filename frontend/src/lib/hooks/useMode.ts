import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type ModeUnlock = Database["public"]["Tables"]["mode_unlocks"]["Row"];
type ModeUnlockInsert = Database["public"]["Tables"]["mode_unlocks"]["Insert"];
type Match = Database["public"]["Tables"]["matches"]["Row"];
type CareRequest = Database["public"]["Tables"]["care_requests"]["Row"];
type CareRequestInsert = Database["public"]["Tables"]["care_requests"]["Insert"];
type FamilyGroup = Database["public"]["Tables"]["family_groups"]["Row"];
type FamilyGroupInsert = Database["public"]["Tables"]["family_groups"]["Insert"];
type FamilyMember = Database["public"]["Tables"]["family_members"]["Row"];
type FamilyMemberInsert = Database["public"]["Tables"]["family_members"]["Insert"];
type Guardian = Database["public"]["Tables"]["guardians"]["Row"];

export interface CaregiverOption {
    id: string;
    nickname: string;
    trustLevel: number;
}

const careRequestKey = (guardianId: string, type: "sent" | "received") =>
    ["care-requests", guardianId, type] as const;
const familyGroupsKey = (guardianId: string) => ["family-groups", guardianId] as const;
const familyMembersKey = (groupId: string) => ["family-members", groupId] as const;

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
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

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

export function useCareRequests(guardianId: string, type: "sent" | "received") {
    const supabase = createClient();

    return useQuery({
        queryKey: careRequestKey(guardianId, type),
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
        staleTime: 20 * 1000,
        placeholderData: (previousData) => previousData,
        refetchOnWindowFocus: false,
    });
}

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
        onMutate: async (variables) => {
            await Promise.all([
                queryClient.cancelQueries({
                    queryKey: careRequestKey(variables.requester_id, "sent"),
                }),
                queryClient.cancelQueries({
                    queryKey: careRequestKey(variables.caregiver_id, "received"),
                }),
            ]);

            const previousSent = queryClient.getQueryData<CareRequest[]>(
                careRequestKey(variables.requester_id, "sent")
            );
            const previousReceived = queryClient.getQueryData<CareRequest[]>(
                careRequestKey(variables.caregiver_id, "received")
            );

            const optimisticRequest: CareRequest = {
                id: `optimistic-${Date.now()}`,
                requester_id: variables.requester_id,
                caregiver_id: variables.caregiver_id,
                dog_id: variables.dog_id ?? null,
                title: variables.title,
                description: variables.description ?? null,
                care_type: variables.care_type,
                datetime: variables.datetime,
                duration_hours: variables.duration_hours ?? 1,
                status: variables.status ?? "pending",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            queryClient.setQueryData<CareRequest[]>(
                careRequestKey(variables.requester_id, "sent"),
                (old = []) => [optimisticRequest, ...old]
            );
            queryClient.setQueryData<CareRequest[]>(
                careRequestKey(variables.caregiver_id, "received"),
                (old = []) => [optimisticRequest, ...old]
            );

            return {
                previousSent,
                previousReceived,
                requesterId: variables.requester_id,
                caregiverId: variables.caregiver_id,
            };
        },
        onError: (_error, _variables, context) => {
            if (!context) return;

            queryClient.setQueryData(
                careRequestKey(context.requesterId, "sent"),
                context.previousSent
            );
            queryClient.setQueryData(
                careRequestKey(context.caregiverId, "received"),
                context.previousReceived
            );
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({
                queryKey: careRequestKey(variables.requester_id, "sent"),
            });
            queryClient.invalidateQueries({
                queryKey: careRequestKey(variables.caregiver_id, "received"),
            });
        },
    });
}

export function useCaregiverOptions(guardianId: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["caregiver-options", guardianId],
        queryFn: async () => {
            const { data: matches, error: matchError } = await supabase
                .from("matches")
                .select("from_guardian_id,to_guardian_id")
                .eq("status", "accepted")
                .or(`from_guardian_id.eq.${guardianId},to_guardian_id.eq.${guardianId}`);

            if (matchError) throw matchError;

            const partnerIds = Array.from(
                new Set(
                    ((matches || []) as Pick<Match, "from_guardian_id" | "to_guardian_id">[]).map(
                        (match) =>
                            match.from_guardian_id === guardianId
                                ? match.to_guardian_id
                                : match.from_guardian_id
                    )
                )
            );

            if (partnerIds.length === 0) {
                return [] as CaregiverOption[];
            }

            const { data: guardians, error: guardianError } = await supabase
                .from("guardians")
                .select("id,nickname")
                .in("id", partnerIds);

            if (guardianError) throw guardianError;

            return ((guardians || []) as Pick<Guardian, "id" | "nickname">[]).map(
                (guardian) => ({
                    id: guardian.id,
                    nickname: guardian.nickname,
                    trustLevel: 0,
                })
            );
        },
        enabled: !!guardianId,
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
    });
}

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

export function useFamilyGroups(guardianId: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: familyGroupsKey(guardianId),
        queryFn: async () => {
            const { data: memberRows, error: memberError } = await supabase
                .from("family_members")
                .select("group_id")
                .eq("member_id", guardianId);

            if (memberError) throw memberError;

            const groupIds = (memberRows || []).map((row) => row.group_id);
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
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useCreateFamilyGroup() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: FamilyGroupInsert) => {
            const groupId = crypto.randomUUID();
            const createdAt = new Date().toISOString();
            const newGroup: FamilyGroup = {
                id: groupId,
                name: input.name ?? "",
                creator_id: input.creator_id,
                dog_ids: input.dog_ids ?? [],
                created_at: createdAt,
            };
            const { error } = await supabase.from("family_groups").insert({
                ...input,
                id: groupId,
            });
            if (error) throw error;

            const { error: memberError } = await supabase.from("family_members").insert({
                group_id: groupId,
                member_id: input.creator_id,
                role: "owner",
            });

            if (memberError) {
                await supabase.from("family_groups").delete().eq("id", groupId);
                throw memberError;
            }

            return newGroup;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({
                queryKey: familyGroupsKey(variables.creator_id),
            });

            const previousGroups = queryClient.getQueryData<FamilyGroup[]>(
                familyGroupsKey(variables.creator_id)
            );

            const optimisticGroup: FamilyGroup = {
                id: `optimistic-${Date.now()}`,
                name: variables.name,
                creator_id: variables.creator_id,
                dog_ids: variables.dog_ids ?? [],
                created_at: new Date().toISOString(),
            };

            queryClient.setQueryData<FamilyGroup[]>(
                familyGroupsKey(variables.creator_id),
                (old = []) => [optimisticGroup, ...old]
            );

            return {
                previousGroups,
                creatorId: variables.creator_id,
            };
        },
        onError: (_error, _variables, context) => {
            if (!context) return;

            queryClient.setQueryData(
                familyGroupsKey(context.creatorId),
                context.previousGroups
            );
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({
                queryKey: familyGroupsKey(variables.creator_id),
            });
        },
    });
}

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
                queryKey: familyMembersKey(variables.group_id),
            });
        },
    });
}

export function useFamilyMembers(groupId: string) {
    const supabase = createClient();
    const isOptimisticGroup = groupId.startsWith("optimistic-");

    return useQuery({
        queryKey: familyMembersKey(groupId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("family_members")
                .select("*")
                .eq("group_id", groupId)
                .order("joined_at", { ascending: true });

            if (error) throw error;
            return (data || []) as FamilyMember[];
        },
        enabled: !!groupId && !isOptimisticGroup,
        staleTime: 30 * 1000,
        retry: 0,
        refetchOnWindowFocus: false,
    });
}
