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
            const { data: participants, error: pErr } = await supabase
                .from("chat_participants")
                .select("room_id")
                .eq("guardian_id", guardianId);

            if (pErr) throw pErr;
            if (!participants || participants.length === 0) return [];

            const roomIds = participants.map((p) => p.room_id);

            // 2. 채팅방 정보
            const { data: rooms, error: rErr } = await supabase
                .from("chat_rooms")
                .select("id, type, last_message_at")
                .in("id", roomIds)
                .order("last_message_at", { ascending: false, nullsFirst: false });

            if (rErr) throw rErr;
            if (!rooms) return [];

            // 3. 각 방의 상대방 정보 + 마지막 메시지 + 안 읽은 수
            const results: ChatRoomItem[] = [];

            for (const room of rooms) {
                // 상대방 guardian_id
                const { data: otherParticipant } = await supabase
                    .from("chat_participants")
                    .select("guardian_id")
                    .eq("room_id", room.id)
                    .neq("guardian_id", guardianId)
                    .single();

                // 상대방 프로필
                let partner = {
                    id: "",
                    nickname: "알 수 없음",
                    avatar_url: null as string | null,
                    dogs: [] as { name: string; photo_urls: string[] | null }[],
                };

                if (otherParticipant) {
                    const { data: g } = await supabase
                        .from("guardians")
                        .select("id, nickname, avatar_url, dogs(name, photo_urls)")
                        .eq("id", otherParticipant.guardian_id)
                        .single();

                    if (g) {
                        partner = {
                            id: g.id,
                            nickname: g.nickname,
                            avatar_url: g.avatar_url,
                            dogs: (g.dogs as { name: string; photo_urls: string[] | null }[]) || [],
                        };
                    }
                }

                // 마지막 메시지
                const { data: lastMsg } = await supabase
                    .from("chat_messages")
                    .select("content, type")
                    .eq("room_id", room.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single();

                // 안 읽은 메시지 수
                const { count: unreadCount } = await supabase
                    .from("chat_messages")
                    .select("id", { count: "exact", head: true })
                    .eq("room_id", room.id)
                    .neq("sender_id", guardianId)
                    .not("read_by", "cs", `{${guardianId}}`);

                results.push({
                    id: room.id,
                    type: room.type as "direct" | "group",
                    last_message_at: room.last_message_at,
                    partner,
                    lastMessage: lastMsg?.content ?? null,
                    lastMessageType: (lastMsg?.type as ChatRoomItem["lastMessageType"]) ?? "text",
                    unreadCount: unreadCount ?? 0,
                });
            }

            return results;
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
            // 기존 방 확인: 내가 참여한 방 중 상대방도 참여한 direct 방
            const { data: myRooms } = await supabase
                .from("chat_participants")
                .select("room_id")
                .eq("guardian_id", myGuardianId);

            if (myRooms && myRooms.length > 0) {
                const myRoomIds = myRooms.map((r) => r.room_id);

                const { data: sharedRoom } = await supabase
                    .from("chat_participants")
                    .select("room_id")
                    .eq("guardian_id", partnerGuardianId)
                    .in("room_id", myRoomIds)
                    .limit(1)
                    .single();

                if (sharedRoom) return sharedRoom.room_id;
            }

            // 새 방 생성
            const { data: newRoom, error: roomErr } = await supabase
                .from("chat_rooms")
                .insert({ type: "direct" })
                .select("id")
                .single();

            if (roomErr) throw roomErr;

            // 참여자 등록
            const { error: pErr } = await supabase
                .from("chat_participants")
                .insert([
                    { room_id: newRoom.id, guardian_id: myGuardianId },
                    { room_id: newRoom.id, guardian_id: partnerGuardianId },
                ]);

            if (pErr) throw pErr;

            return newRoom.id;
        },
    });
}
