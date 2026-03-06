---
name: page-chat-room-upgrade
description: /chat/[id] UI/UX 하드닝 및 실시간 채팅 + 약속 기능 완성 워크플로우.
---

# page-chat-room-upgrade

## Trigger
- /chat/[id] 개선, 폴리싱, 실데이터 연결 요청 시
- 실시간 메시지 및 약속 제안/수락 기능 연결 시

## Input Context
- Route: `/chat/[id]`
- Page file: `frontend/src/app/(main)/chat/[id]/page.tsx`
- Parity: DANG-CHT-001
- Priority: P0

## Read First
1. docs/status/PAGE-UPGRADE-BOARD.md
2. docs/status/SKILL-DOC-MATRIX.md
3. docs/status/PROJECT-STATUS.md
4. frontend/src/app/(main)/chat/[id]/page.tsx
5. frontend/src/components/features/chat/ScheduleModal.tsx
6. frontend/src/lib/hooks/useChat.ts

## Current State
- Realtime 부분 연결 (Supabase Realtime 채널)
- guardian ID 하드코딩 (`myGuardianId` 상수)
- ScheduleModal 존재하나 DB 미연결
- 파트너 이름 하드코딩
- 약속 수락/거절 미구현

## Target Files
| File | Role | Action |
|---|---|---|
| `frontend/src/app/(main)/chat/[id]/page.tsx` | 채팅방 라우트 | Modify |
| `frontend/src/components/features/chat/ScheduleModal.tsx` | 약속 모달 | Modify |
| `frontend/src/lib/hooks/useChat.ts` | 채팅 훅 | Modify |
| `frontend/src/lib/hooks/useSchedule.ts` | 약속 관리 훅 | Create |

## Schema Dependencies
| Table | Operations | Storage |
|---|---|---|
| `chat_messages` | SELECT, INSERT (Realtime) | — |
| `chat_participants` | SELECT (참여자 조회) | — |
| `guardians` | SELECT (파트너 정보 JOIN) | — |
| `schedules` | INSERT, UPDATE (약속 제안/수락/거절) | — |
| `walk_records` | INSERT (완료 약속 → 산책 기록) | — |

## Do
1. 현재 갭을 board + parity 노트 기준으로 확인
2. 이 라우트와 직접 관련된 컴포넌트/훅으로만 스코프 제한
3. 결정적 loading/empty/error/success 상태 구현
4. 토큰 + 기존 공유 컴포넌트 재사용
5. Supabase MCP로 테이블/RLS 검증
6. docs/daily + board 상태 동기화

## Do Not
- 다른 라우트로 스코프 확장 금지
- 관련 없는 공유 아키텍처 리라이트 금지
- mock 동작 도입 시 명시적 TODO 없이 금지

## Implementation Runbook
1. **하드코딩 `myGuardianId` → auth 유저로 교체** — Supabase auth.getUser()로 현재 유저 조회 후 guardians 테이블에서 guardian_id 매핑.
2. **파트너 이름을 chat_participants + guardians JOIN으로 가져오기** — chat_participants에서 상대방 guardian_id → guardians.nickname 조회.
3. **ScheduleModal → schedules 테이블 INSERT 연결** — `useSchedule.ts` 훅 생성. `useCreateSchedule()` 뮤테이션으로 약속 제안.
4. **약속 수락/거절 → proposal_status UPDATE** — `useUpdateScheduleStatus()` 뮤테이션. 'proposed' → 'accepted' | 'rejected'.
5. **완료된 약속 → walk_record 생성 프롬프트** — 약속 시간 지나면 "산책 어떠셨나요?" 프롬프트 → walk_records INSERT.
6. **메시지 타임스탬프 + 읽음 표시** — 날짜 구분선, 시간 표시, Realtime으로 읽음 상태 업데이트.

## Validation
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npx next lint`
- 라우트 렌더링 에러 없음
- Loading/empty/error 상태 시각적 일관성
- API/데이터 바인딩이 예상 계약과 일치
- Board 행 업데이트 완료

## P0 Additional Checks
- 실시간 메시지가 delay 없이 표시
- 스크롤이 새 메시지에서 자동으로 하단 이동
- 약속 카드가 채팅 흐름에 자연스럽게 삽입
- 키보드 올라올 때 입력창 위치 정상

## Acceptance Criteria
- 실시간 메시지 송수신이 DB에 반영 (chat_messages INSERT)
- 약속 제안 → schedules 행 생성 (proposal_status: 'proposed')
- 약속 수락 → proposal_status: 'accepted'
- 약속 거절 → proposal_status: 'rejected'
- 파트너 닉네임이 실 데이터로 표시
- 하드코딩된 guardian ID 제거

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
