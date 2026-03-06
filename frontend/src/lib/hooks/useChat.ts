// File: Chat data hooks for room list, message stream, and room creation flows.
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage, ChatRoomItem } from "@/components/features/chat/types";

export function useChatRooms(guardianId: string) {
    const supabase = createClient();
    const queryClient = useQueryClient();

    const query = useQuery<ChatRoomItem[]>({
        queryKey: ["chat-rooms", guardianId],
        queryFn: async () => {
            if (!guardianId) return [];

            const partnerHintsByRoom = new Map<string, string>();
            let roomIds: string[] = [];

            const { data: myParticipants, error: participantsError } = await supabase
                .from("chat_participants")
                .select("room_id")
                .eq("guardian_id", guardianId);

            if (!participantsError && myParticipants?.length) {
                roomIds = myParticipants.map((participant) => participant.room_id);
            }

            // Fallback path for RLS/mismatch cases: accepted match -> ensure direct room via RPC.
            if (roomIds.length === 0) {
                const { data: acceptedMatches, error: matchesError } = await supabase
                    .from("matches")
                    .select("from_guardian_id, to_guardian_id")
                    .or(`from_guardian_id.eq.${guardianId},to_guardian_id.eq.${guardianId}`)
                    .eq("status", "accepted");

                if (!matchesError && acceptedMatches?.length) {
                    for (const match of acceptedMatches) {
                        const partnerId =
                            match.from_guardian_id === guardianId
                                ? match.to_guardian_id
                                : match.from_guardian_id;

                        if (!partnerId) continue;

                        const { data: roomId, error: rpcError } = await supabase.rpc(
                            "create_chat_room_with_participants",
                            {
                                p_my_guardian_id: guardianId,
                                p_partner_guardian_id: partnerId,
                            }
                        );

                        if (rpcError) {
                            console.warn("create_chat_room_with_participants failed", rpcError.message);
                            continue;
                        }

                        if (roomId) {
                            roomIds.push(roomId);
                            partnerHintsByRoom.set(roomId, partnerId);
                        }
                    }
                } else if (participantsError) {
                    console.warn("chat_participants query failed", participantsError.message);
                }
            }

            roomIds = Array.from(new Set(roomIds));
            if (roomIds.length === 0) return [];

            const { data: roomRows, error: roomsError } = await supabase
                .from("chat_rooms")
                .select("id, type, last_message_at")
                .in("id", roomIds)
                .order("last_message_at", { ascending: false, nullsFirst: false });

            const rooms: { id: string; type: "direct" | "group"; last_message_at: string | null }[] =
                roomRows && roomRows.length > 0
                    ? (roomRows as { id: string; type: "direct" | "group"; last_message_at: string | null }[])
                    : roomIds.map((id) => ({ id, type: "direct", last_message_at: null }));

            if (roomsError) {
                console.warn("chat_rooms query failed, using fallback room list", roomsError.message);
            }

            const partnerByRoom = new Map<string, string>(partnerHintsByRoom);
            const partnerIds = new Set<string>();

            const { data: allParticipants, error: allParticipantsError } = await supabase
                .from("chat_participants")
                .select("room_id, guardian_id")
                .in("room_id", roomIds)
                .neq("guardian_id", guardianId);

            if (allParticipantsError) {
                console.warn("chat_participants(room) query failed", allParticipantsError.message);
            }

            for (const participant of allParticipants ?? []) {
                partnerByRoom.set(participant.room_id, participant.guardian_id);
                partnerIds.add(participant.guardian_id);
            }

            for (const hintedPartnerId of Array.from(partnerHintsByRoom.values())) {
                partnerIds.add(hintedPartnerId);
            }

            const partnerMap = new Map<
                string,
                {
                    id: string;
                    nickname: string;
                    avatar_url: string | null;
                    dogs: { name: string; photo_urls: string[] | null }[];
                }
            >();

            const partnerIdArray = Array.from(partnerIds);
            if (partnerIdArray.length > 0) {
                const { data: partners, error: partnerError } = await supabase
                    .from("guardians")
                    .select("id, nickname, avatar_url, dogs(name, photo_urls)")
                    .in("id", partnerIdArray);

                if (partnerError) {
                    console.warn("guardians(partner) query failed", partnerError.message);
                }

                for (const guardian of partners ?? []) {
                    partnerMap.set(guardian.id, {
                        id: guardian.id,
                        nickname: guardian.nickname,
                        avatar_url: guardian.avatar_url,
                        dogs: (guardian.dogs as { name: string; photo_urls: string[] | null }[]) || [],
                    });
                }
            }

            const roomDetails = await Promise.all(
                rooms.map(async (room) => {
                    const [lastMsgResult, unreadResult] = await Promise.all([
                        supabase
                            .from("chat_messages")
                            .select("content, type")
                            .eq("room_id", room.id)
                            .order("created_at", { ascending: false })
                            .limit(1)
                            .maybeSingle(),
                        supabase
                            .from("chat_messages")
                            .select("id", { count: "exact", head: true })
                            .eq("room_id", room.id)
                            .neq("sender_id", guardianId)
                            .not("read_by", "cs", `{${guardianId}}`),
                    ]);

                    const partnerId = partnerByRoom.get(room.id);
                    const partner = partnerId
                        ? partnerMap.get(partnerId) ?? {
                              id: "",
                              nickname: "알 수 없는 보호자",
                              avatar_url: null,
                              dogs: [],
                          }
                        : {
                              id: "",
                              nickname: "알 수 없는 보호자",
                              avatar_url: null,
                              dogs: [],
                          };

                    return {
                        id: room.id,
                        type: room.type,
                        last_message_at: room.last_message_at,
                        partner,
                        lastMessage: lastMsgResult.data?.content ?? null,
                        lastMessageType:
                            (lastMsgResult.data?.type as ChatRoomItem["lastMessageType"]) ?? "text",
                        unreadCount: unreadResult.count ?? 0,
                    } satisfies ChatRoomItem;
                })
            );

            roomDetails.sort((a, b) => {
                const at = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
                const bt = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
                return bt - at;
            });

            return roomDetails;
        },
        enabled: !!guardianId,
    });

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
    }, [guardianId, queryClient, supabase]);

    return query;
}

export function useChatRoom(roomId: string) {
    const supabase = createClient();
    const queryClient = useQueryClient();
    const queryKey = ["chat-messages", roomId];

    const { data: messages, isLoading, error } = useQuery<ChatMessage[]>({
        queryKey,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("chat_messages")
                .select("*")
                .eq("room_id", roomId)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("[chat/useChatRoom] failed to fetch chat_messages", {
                    roomId,
                    error,
                });
                throw error;
            }
            return (data as ChatMessage[]) || [];
        },
        enabled: !!roomId,
    });

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
                    queryClient.setQueryData(queryKey, (oldData: ChatMessage[] | undefined) => {
                        if (!oldData) return [payload.new as ChatMessage];
                        const exists = oldData.find((msg) => msg.id === (payload.new as ChatMessage).id);
                        if (exists) return oldData;
                        return [...oldData, payload.new as ChatMessage];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, queryClient, supabase]);

    return { messages, isLoading, error };
}

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

            await supabase
                .from("chat_rooms")
                .update({ last_message_at: new Date().toISOString() })
                .eq("id", room_id);

            return data;
        },
    });
}

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
            const { data: unread } = await supabase
                .from("chat_messages")
                .select("id, read_by")
                .eq("room_id", roomId)
                .neq("sender_id", guardianId)
                .not("read_by", "cs", `{${guardianId}}`);

            if (!unread || unread.length === 0) return;

            for (const message of unread) {
                const currentReadBy = (message.read_by as string[]) || [];
                await supabase
                    .from("chat_messages")
                    .update({ read_by: [...currentReadBy, guardianId] })
                    .eq("id", message.id);
            }
        },
    });
}

export function useChatPartner(roomId: string, myGuardianId: string) {
    const supabase = createClient();

    return useQuery<{ guardianId: string; nickname: string } | null>({
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

            if (!guardian?.nickname) return null;
            return {
                guardianId: otherParticipant.guardian_id,
                nickname: guardian.nickname,
            };
        },
        enabled: !!roomId && !!myGuardianId,
    });
}

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
            const { data, error } = await supabase.rpc("create_chat_room_with_participants", {
                p_my_guardian_id: myGuardianId,
                p_partner_guardian_id: partnerGuardianId,
            });

            if (error) throw error;
            return data as string;
        },
    });
}
