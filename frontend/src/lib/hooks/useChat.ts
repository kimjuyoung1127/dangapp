// useChat.ts — 채팅방 목록 + 채팅룸 + 메시지 전송 훅 (DANG-CHT-001)

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ChatRoomItem, ChatMessage } from "@/components/features/chat/types";

// ─── 채팅방 목록 (내가 참여 중인 방들) ───
export function useChatRooms(guardianId: string) {
    const supabase = createClient();
    const queryClient = useQueryClient();

    const query = useQuery<ChatRoomItem[]>({
        queryKey: ["chat-rooms", guardianId],
        queryFn: async () => {
            // 1. 내가 참여 중인 room_ids
            const { data: myParticipants, error: pErr } = await supabase
                .from("chat_participants")
                .select("room_id")
                .eq("guardian_id", guardianId);

            if (pErr) throw pErr;
            if (!myParticipants || myParticipants.length === 0) return [];

            const roomIds = myParticipants.map((p) => p.room_id);

            // 2. 채팅방 정보
            const { data: rooms, error: rErr } = await supabase
                .from("chat_rooms")
                .select("id, type, last_message_at")
                .in("id", roomIds)
                .order("last_message_at", { ascending: false, nullsFirst: false });

            if (rErr) throw rErr;
            if (!rooms || rooms.length === 0) return [];

            // 3. 배치: 모든 방의 상대방 participant 일괄 조회
            const { data: allParticipants } = await supabase
                .from("chat_participants")
                .select("room_id, guardian_id")
                .in("room_id", roomIds)
                .neq("guardian_id", guardianId);

            const partnerByRoom = new Map<string, string>();
            const partnerIds = new Set<string>();
            for (const p of allParticipants ?? []) {
                partnerByRoom.set(p.room_id, p.guardian_id);
                partnerIds.add(p.guardian_id);
            }

            // 4. 배치: 상대방 프로필 일괄 조회
            const partnerIdArray = Array.from(partnerIds);
            const partnerMap = new Map<string, {
                id: string;
                nickname: string;
                avatar_url: string | null;
                dogs: { name: string; photo_urls: string[] | null }[];
            }>();

            if (partnerIdArray.length > 0) {
                const { data: partners } = await supabase
                    .from("guardians")
                    .select("id, nickname, avatar_url, dogs(name, photo_urls)")
                    .in("id", partnerIdArray);

                for (const g of partners ?? []) {
                    partnerMap.set(g.id, {
                        id: g.id,
                        nickname: g.nickname,
                        avatar_url: g.avatar_url,
                        dogs: (g.dogs as { name: string; photo_urls: string[] | null }[]) || [],
                    });
                }
            }

            // 5. 각 방의 마지막 메시지 + 안 읽은 수 (room별로 필요하지만 병렬 실행)
            const roomDetails = await Promise.all(
                rooms.map(async (room) => {
                    const [lastMsgResult, unreadResult] = await Promise.all([
                        supabase
                            .from("chat_messages")
                            .select("content, type")
                            .eq("room_id", room.id)
                            .order("created_at", { ascending: false })
                            .limit(1)
                            .single(),
                        supabase
                            .from("chat_messages")
                            .select("id", { count: "exact", head: true })
                            .eq("room_id", room.id)
                            .neq("sender_id", guardianId)
                            .not("read_by", "cs", `{${guardianId}}`),
                    ]);

                    const partnerId = partnerByRoom.get(room.id);
                    const partner = partnerId
                        ? partnerMap.get(partnerId) ?? { id: "", nickname: "알 수 없음", avatar_url: null, dogs: [] }
                        : { id: "", nickname: "알 수 없음", avatar_url: null, dogs: [] };

                    return {
                        id: room.id,
                        type: room.type as "direct" | "group",
                        last_message_at: room.last_message_at,
                        partner,
                        lastMessage: lastMsgResult.data?.content ?? null,
                        lastMessageType: (lastMsgResult.data?.type as ChatRoomItem["lastMessageType"]) ?? "text",
                        unreadCount: unreadResult.count ?? 0,
                    } satisfies ChatRoomItem;
                })
            );

            return roomDetails;
        },
        enabled: !!guardianId,
    });

    // Realtime: 새 메시지 → 채팅방 목록 갱신
    useEffect(() => {
        if (!guardianId) return;

        const channel = supabase
            .channel("chat-rooms-realtime")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages",
                },
                () => {
                    queryClient.invalidateQueries({
                        queryKey: ["chat-rooms", guardianId],
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [guardianId, supabase, queryClient]);

    return query;
}

// ─── 특정 채팅방의 메시지 내역 + Realtime 구독 ───
export function useChatRoom(roomId: string) {
    const supabase = createClient();
    const queryClient = useQueryClient();
    const queryKey = ["chat-messages", roomId];

    const { data: messages, isLoading } = useQuery<ChatMessage[]>({
        queryKey,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("chat_messages")
                .select("*")
                .eq("room_id", roomId)
                .order("created_at", { ascending: true });

            if (error) throw error;
            return (data as ChatMessage[]) || [];
        },
        enabled: !!roomId,
    });

    // Realtime Subscription
    useEffect(() => {
        if (!roomId) return;

        const channel = supabase
            .channel(`chat_messages:room_id=eq.${roomId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages",
                    filter: `room_id=eq.${roomId}`,
                },
                (payload) => {
                    queryClient.setQueryData(
                        queryKey,
                        (oldData: ChatMessage[] | undefined) => {
                            if (!oldData) return [payload.new as ChatMessage];
                            const exists = oldData.find(
                                (msg) => msg.id === (payload.new as ChatMessage).id
                            );
                            if (exists) return oldData;
                            return [...oldData, payload.new as ChatMessage];
                        }
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, supabase, queryClient]);

    return { messages, isLoading };
}

// ─── 메시지 전송 Mutation ───
export function useSendMessage() {
    const supabase = createClient();

    return useMutation({
        mutationFn: async ({
            room_id,
            sender_id,
            content,
            type = "text",
            metadata = null,
        }: {
            room_id: string;
            sender_id: string;
            content: string;
            type?: "text" | "image" | "schedule" | "system";
            metadata?: Record<string, unknown> | null;
        }) => {
            const { data, error } = await supabase
                .from("chat_messages")
                .insert({ room_id, sender_id, content, type, metadata })
                .select()
                .single();

            if (error) throw error;

            // 채팅방 last_message_at 업데이트
            await supabase
                .from("chat_rooms")
                .update({ last_message_at: new Date().toISOString() })
                .eq("id", room_id);

            return data;
        },
    });
}

// ─── 읽음 처리 ───
export function useMarkAsRead() {
    const supabase = createClient();

    return useMutation({
        mutationFn: async ({
            roomId,
            guardianId,
        }: {
            roomId: string;
            guardianId: string;
        }) => {
            // 내가 보내지 않은 + 아직 안 읽은 메시지들의 read_by에 나를 추가
            const { data: unread } = await supabase
                .from("chat_messages")
                .select("id, read_by")
                .eq("room_id", roomId)
                .neq("sender_id", guardianId)
                .not("read_by", "cs", `{${guardianId}}`);

            if (!unread || unread.length === 0) return;

            for (const msg of unread) {
                const currentReadBy = (msg.read_by as string[]) || [];
                await supabase
                    .from("chat_messages")
                    .update({ read_by: [...currentReadBy, guardianId] })
                    .eq("id", msg.id);
            }
        },
    });
}

// ─── 채팅방 상대방 이름 조회 ───
export function useChatPartner(roomId: string, myGuardianId: string) {
    const supabase = createClient();

    return useQuery<string | null>({
        queryKey: ["chat-partner", roomId, myGuardianId],
        queryFn: async () => {
            const { data: otherParticipant } = await supabase
                .from("chat_participants")
                .select("guardian_id")
                .eq("room_id", roomId)
                .neq("guardian_id", myGuardianId)
                .single();

            if (!otherParticipant) return null;

            const { data: guardian } = await supabase
                .from("guardians")
                .select("nickname")
                .eq("id", otherParticipant.guardian_id)
                .single();

            return guardian?.nickname ?? null;
        },
        enabled: !!roomId && !!myGuardianId,
    });
}

// ─── 채팅방 생성 또는 기존 방 찾기 (매칭 후 채팅 진입용) ───
// SECURITY DEFINER RPC로 RLS 우회하여 양쪽 participant 원자적 삽입
export function useGetOrCreateChatRoom() {
    const supabase = createClient();

    return useMutation({
        mutationFn: async ({
            myGuardianId,
            partnerGuardianId,
        }: {
            myGuardianId: string;
            partnerGuardianId: string;
        }) => {
            const { data, error } = await supabase.rpc(
                "create_chat_room_with_participants",
                {
                    p_my_guardian_id: myGuardianId,
                    p_partner_guardian_id: partnerGuardianId,
                }
            );

            if (error) throw error;
            return data as string;
        },
    });
}
