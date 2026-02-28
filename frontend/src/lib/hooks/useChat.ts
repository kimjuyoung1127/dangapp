import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

// 특정 채팅방의 메시지 내역 가져오기 + Realtime 구독
export function useChatRoom(roomId: string) {
    const supabase = createClient();
    const queryClient = useQueryClient();
    const queryKey = ['chat-messages', roomId];

    const { data: messages, isLoading } = useQuery({
        queryKey,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('room_id', roomId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data || [];
        },
        enabled: !!roomId,
    });

    // Realtime Subscription 설정
    useEffect(() => {
        if (!roomId) return;

        const channel = supabase.channel(`chat_messages:room_id=eq.${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `room_id=eq.${roomId}`
                },
                (payload) => {
                    // 새로 인서트된 메시지를 기존 캐시에 붙이기
                    queryClient.setQueryData(queryKey, (oldData: { id: string;[key: string]: unknown }[]) => {
                        if (!oldData) return [payload.new];
                        // 중복 체크방지 (옵티미스틱 UI 적용 시 유용)
                        const exists = oldData.find(msg => msg.id === payload.new.id);
                        if (exists) return oldData;
                        return [...oldData, payload.new];
                    });
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

// 메시지 전송 Mutation
export function useSendMessage() {
    const supabase = createClient();

    return useMutation({
        mutationFn: async ({
            room_id,
            sender_id,
            content,
            type = 'text',
            metadata = null
        }: {
            room_id: string;
            sender_id: string;
            content: string;
            type?: 'text' | 'image' | 'schedule' | 'system';
            metadata?: Record<string, unknown> | null;
        }) => {
            const { data, error } = await supabase
                .from('chat_messages')
                .insert({
                    room_id,
                    sender_id,
                    content,
                    type,
                    metadata
                })
                .select()
                .single();

            if (error) throw error;

            // 채팅방의 last_message_at 업데이트 (채팅 목록 정렬용)
            await supabase
                .from('chat_rooms')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', room_id);

            return data;
        }
    });
}
