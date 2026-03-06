---
name: page-chat-list-upgrade
description: /chat 목록 UI/UX 하드닝 및 실데이터 연결 워크플로우.
---

# page-chat-list-upgrade

## Trigger
- /chat 목록 개선, 폴리싱, 실데이터 연결 요청 시

## Input Context
- Route: `/chat`
- Page file: `frontend/src/app/(main)/chat/page.tsx`
- Parity: DANG-CHT-001
- Priority: P1

## Read First
1. docs/status/PAGE-UPGRADE-BOARD.md
2. docs/status/SKILL-DOC-MATRIX.md
3. docs/status/PROJECT-STATUS.md
4. frontend/src/app/(main)/chat/page.tsx
5. frontend/src/lib/hooks/useChat.ts

## Current State
- mockChats 하드코딩 데이터 사용
- Realtime 미연결
- unread 카운트 미구현
- 채팅방 목록 정렬 (최근 메시지 순) 미구현

## Target Files
| File | Role | Action |
|---|---|---|
| `frontend/src/app/(main)/chat/page.tsx` | 채팅 목록 라우트 | Modify |
| `frontend/src/lib/hooks/useChat.ts` | 채팅 훅 | Modify |

## Schema Dependencies
| Table | Operations | Storage |
|---|---|---|
| `chat_rooms` | SELECT (목록 조회) | — |
| `chat_participants` | SELECT (참여자 JOIN) | — |
| `chat_messages` | SELECT (최근 메시지, Realtime) | — |
| `guardians` | SELECT (상대방 닉네임/아바타) | `dog-profiles` (아바타) |

## Do
1. 현재 갭을 board + parity 노트 기준으로 확인
2. 이 라우트와 직접 관련된 컴포넌트/훅으로만 스코프 제한
3. 결정적 loading/empty/error/success 상태 구현
4. 토큰 + 기존 공유 컴포넌트 재사용
5. docs/daily + board 상태 동기화

## Do Not
- 다른 라우트로 스코프 확장 금지
- 관련 없는 공유 아키텍처 리라이트 금지
- mock 동작 도입 시 명시적 TODO 없이 금지

## Implementation Runbook
1. **mockChats → chat_rooms JOIN 쿼리** — `useChatRooms()` 훅으로 교체. chat_rooms + chat_participants + guardians + 최근 chat_messages JOIN.
2. **unread 카운트** — chat_messages에서 읽지 않은 메시지 수 계산. 뱃지 표시.
3. **Realtime 구독** — 새 메시지 도착 시 목록 자동 업데이트 + 순서 재정렬.
4. **빈 상태** — 채팅방 없을 때 "아직 대화가 없어요. 매칭을 시작해보세요!" 메시지.
5. **최근 메시지 순 정렬** — last_message_at 기준 내림차순.

## Validation
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npx next lint`
- 라우트 렌더링 에러 없음
- Loading/empty/error 상태 시각적 일관성
- Board 행 업데이트 완료

## Acceptance Criteria
- 실 chat_rooms 데이터로 목록 렌더링
- unread 뱃지가 정확한 숫자 표시
- 새 메시지 도착 시 실시간 목록 업데이트
- 빈 상태 UI 표시 (채팅방 0개)
- 채팅방 클릭 → /chat/[id]로 네비게이션

## Forbidden
- MOCK_* 상수 최종 코드에 남기지 않음
- setTimeout 로딩 시뮬레이션 금지
- 페이지에서 직접 supabase.from() 금지 (SKILL-05)
- 인라인 className 조건 금지 (SKILL-01/02)

## Output Template
- Scope: DANG-CHT-001
- Files:
- Validation:
- Daily Sync:
- Risks:
- Self-Review:
- Next Recommendations:
