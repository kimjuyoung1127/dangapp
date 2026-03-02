# /chat + /chat/[id] — DANG-CHT-001 구현 로그 (2026-03-02)

## Scope
DANG-CHT-001

## 변경 파일

| 액션 | 파일 | 설명 |
|------|------|------|
| CREATE | `frontend/src/components/features/chat/types.ts` | ChatRoomItem, ChatMessage, ChatPartner 타입 |
| CREATE | `frontend/src/components/features/chat/ChatEmptyState.tsx` | 채팅 목록 빈 상태 컴포넌트 |
| REWRITE | `frontend/src/lib/hooks/useChat.ts` | useChatRooms, useChatRoom, useSendMessage, useMarkAsRead, useChatPartner, useGetOrCreateChatRoom |
| REWRITE | `frontend/src/app/(main)/chat/page.tsx` | 실제 Supabase 바인딩 + Realtime 채팅방 목록 |
| REWRITE | `frontend/src/app/(main)/chat/[id]/page.tsx` | useCurrentGuardian 바인딩 + 읽음 처리 + 상대방 이름 조회 |
| MODIFY | `frontend/src/app/(main)/home/page.tsx` | useGetOrCreateChatRoom 연결 (매칭→채팅 전환) |

## 검증

- `npx tsc --noEmit`: 타입 에러 0
- `npx next lint`: ESLint 에러 0
- `npm run build`: 빌드 성공 (/chat 5.83kB, /chat/[id] 5.34kB)

## 주요 구현 사항

1. **useChatRooms**: 내 참여 방 → 상대방 프로필 + 마지막 메시지 + 안 읽은 수 조회, Realtime INSERT 감지
2. **useChatRoom**: 기존 Realtime 유지 + ChatMessage 타입 적용
3. **useSendMessage**: 기존 유지 (chat_rooms.last_message_at 업데이트)
4. **useMarkAsRead**: 방 입장 시 read_by 배열에 나 추가
5. **useChatPartner**: 채팅방 상대방 닉네임 조회
6. **useGetOrCreateChatRoom**: 매칭 후 채팅 진입 시 기존 방 찾거나 새 방 생성
7. **/chat**: 채팅방 목록 실시간 표시, 안 읽은 수 뱃지, 시간 포맷
8. **/chat/[id]**: myGuardianId 하드코딩 제거, 읽음 처리, 상대방 이름 헤더

## 리스크

- useChatRooms의 N+1 쿼리 (각 방별 상대방/마지막메시지/안읽은수) → 추후 RPC로 최적화 가능
- read_by 업데이트의 동시성 (두 사용자 동시 읽음 시) → 현재 단순 배열 append

## Status
Ready → QA
