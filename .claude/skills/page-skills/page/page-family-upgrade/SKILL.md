---
name: page-family-upgrade
description: /family 가족 그룹 UI/UX 하드닝 및 CRUD 연결 워크플로우.
---

# page-family-upgrade

## Trigger
- /family 개선, 폴리싱, 실데이터 연결 요청 시

## Input Context
- Route: `/family`
- Page file: `frontend/src/app/(main)/family/page.tsx`
- Parity: DANG-B2B-001
- Priority: P2

## Read First
1. docs/status/PAGE-UPGRADE-BOARD.md
2. docs/status/SKILL-DOC-MATRIX.md
3. docs/status/PROJECT-STATUS.md
4. frontend/src/app/(main)/family/page.tsx

## Current State
- mock 가족 그룹 데이터 사용
- useFamilyGroups 훅 미생성
- 멤버 초대 미구현

## Target Files
| File | Role | Action |
|---|---|---|
| `frontend/src/app/(main)/family/page.tsx` | 가족 라우트 | Modify |
| `frontend/src/lib/hooks/useFamily.ts` | 가족 훅 | Create |

## Schema Dependencies
| Table | Operations | Storage |
|---|---|---|
| `family_groups` | SELECT, INSERT, UPDATE, DELETE | — |
| `family_members` | SELECT, INSERT, DELETE | — |
| `guardians` | SELECT (멤버 정보) | `dog-profiles` (아바타) |

## Do
1. 현재 갭을 board + parity 노트 기준으로 확인
2. 이 라우트와 직접 관련된 컴포넌트/훅으로만 스코프 제한
3. 결정적 loading/empty/error/success 상태 구현
4. docs/daily + board 상태 동기화

## Do Not
- 다른 라우트로 스코프 확장 금지
- 관련 없는 공유 아키텍처 리라이트 금지

## Implementation Runbook
1. **mock → useFamilyGroups CRUD** — `useFamily.ts` 생성. 가족 그룹 목록, 생성, 수정, 삭제.
2. **멤버 초대** — 초대 링크/코드 생성 → family_members INSERT.
3. **멤버 관리** — 멤버 목록 표시, 역할 변경, 멤버 제거.
4. **반려견 공유** — 가족 그룹 내 반려견 정보 공유 표시.
5. **빈 상태** — 가족 그룹 없을 때 "가족과 함께 반려견을 돌봐보세요" 메시지 + 그룹 생성 CTA.

## Validation
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npx next lint`
- 라우트 렌더링 에러 없음
- Board 행 업데이트 완료

## Acceptance Criteria
- 실 family_groups 데이터로 그룹 표시
- 그룹 생성 → family_groups INSERT
- 멤버 초대 → family_members INSERT
- 멤버 제거 → family_members DELETE

## Forbidden
- MOCK_* 상수 최종 코드에 남기지 않음
- setTimeout 로딩 시뮬레이션 금지
- 페이지에서 직접 supabase.from() 금지 (SKILL-05)
- 인라인 className 조건 금지 (SKILL-01/02)

## Output Template
- Scope: DANG-B2B-001
- Files:
- Validation:
- Daily Sync:
- Risks:
- Self-Review:
- Next Recommendations:
