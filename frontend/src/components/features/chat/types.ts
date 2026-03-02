// types.ts — Chat 관련 타입 정의 (DANG-CHT-001)

export interface ChatPartner {
    id: string;
    nickname: string;
    avatar_url: string | null;
    dogs: { name: string; photo_urls: string[] | null }[];
}

export interface ChatRoomItem {
    id: string;
    type: "direct" | "group";
    last_message_at: string | null;
    partner: ChatPartner;
    lastMessage: string | null;
    lastMessageType: "text" | "image" | "schedule" | "system";
    unreadCount: number;
}

export interface ChatMessage {
    id: string;
    room_id: string;
    sender_id: string | null;
    type: "text" | "image" | "schedule" | "system";
    content: string | null;
    metadata: Record<string, unknown> | null;
    read_by: string[] | null;
    created_at: string;
}
