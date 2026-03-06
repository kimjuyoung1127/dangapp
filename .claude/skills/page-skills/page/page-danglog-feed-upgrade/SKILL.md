---
name: page-danglog-feed-upgrade
description: /danglog 피드 UI/UX 하드닝 및 공동기록/공유 기능 완성 워크플로우.
---

# page-danglog-feed-upgrade

## Trigger
- /danglog 개선, 폴리싱, 실데이터 연결 요청 시
- 공동기록 초대 및 공유 기능 구현 시

## Input Context
- Route: `/danglog`
- Page file: `frontend/src/app/(main)/danglog/page.tsx`
- Parity: DANG-DLG-001
- Priority: P1

## Read First
1. docs/status/PAGE-UPGRADE-BOARD.md
2. docs/status/SKILL-DOC-MATRIX.md
3. docs/status/PROJECT-STATUS.md
4. frontend/src/app/(main)/danglog/page.tsx
5. frontend/src/lib/hooks/useDangLog.ts

## Current State
- mock 피드 데이터 사용
- useDangLogs 훅 존재하나 연결 안됨
- 좋아요/댓글 CRUD 미구현
- 공동기록 초대 미구현
- 공유 기능 (카카오톡/인스타/메일/링크 복사) 미구현

## Target Files
| File | Role | Action |
|---|---|---|
| `frontend/src/app/(main)/danglog/page.tsx` | 댕로그 피드 라우트 | Modify |
| `frontend/src/lib/hooks/useDangLog.ts` | 댕로그 훅 | Modify |
| `frontend/src/components/features/danglog/DanglogCard.tsx` | 댕로그 카드 | Modify |
| `frontend/src/components/features/danglog/ShareModal.tsx` | 공유 모달 | Create |
| `frontend/src/components/features/danglog/InviteCollaborator.tsx` | 공동기록 초대 | Create |

## Schema Dependencies
| Table | Operations | Storage |
|---|---|---|
| `danglogs` | SELECT, INSERT, UPDATE | `danglog-media` (사진/영상) |
| `danglog_comments` | SELECT, INSERT, DELETE | — |
| `danglog_likes` | INSERT, DELETE (토글) | — |
| `danglog_collaborators` | SELECT (참여자 목록) | — |
| `danglog_invites` | INSERT (초대 생성), UPDATE (수락/거절) | — |
| `guardians` | SELECT (작성자/참여자 정보) | `dog-profiles` (아바타) |

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
1. **mock → useDangLogs 연결** — `useDangLogs()` 훅으로 피드 데이터 로드. 무한 스크롤 페이지네이션.
2. **좋아요 CRUD** — `useToggleLike()` 뮤테이션. danglog_likes INSERT/DELETE 토글.
3. **댓글 CRUD** — `useCreateComment()`, `useDeleteComment()` 뮤테이션.
4. **공동기록 초대** — `InviteCollaborator` 컴포넌트. 매칭된 보호자 목록에서 선택 → danglog_invites INSERT. 참여자 아바타 표시.
5. **공유 기능** — `ShareModal` 컴포넌트. 카카오톡 공유 (Kakao SDK), 인스타그램 스토리, 이메일, 링크 복사. Web Share API 우선 사용.
6. **빈 상태** — 댕로그 없을 때 "첫 댕로그를 작성해보세요!" + 작성 CTA.

## Validation
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npx next lint`
- 라우트 렌더링 에러 없음
- Loading/empty/error 상태 시각적 일관성
- Board 행 업데이트 완료

## Acceptance Criteria
- 실 danglogs 데이터로 피드 렌더링
- 좋아요 토글 → danglog_likes 반영
- 댓글 작성/삭제 → danglog_comments 반영
- 공동기록 초대 → danglog_invites 행 생성
- 공유 모달에서 4가지 공유 방법 동작 (카카오톡/인스타/메일/링크)
- 참여자 아바타가 댕로그 카드에 표시

## Forbidden
- MOCK_* 상수 최종 코드에 남기지 않음
- setTimeout 로딩 시뮬레이션 금지
- 페이지에서 직접 supabase.from() 금지 (SKILL-05)
- 인라인 className 조건 금지 (SKILL-01/02)

## Output Template
- Scope: DANG-DLG-001
- Files:
- Validation:
- Daily Sync:
- Risks:
- Self-Review:
- Next Recommendations:
