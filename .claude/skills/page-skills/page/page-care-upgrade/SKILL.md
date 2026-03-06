---
name: page-care-upgrade
description: /care 돌봄 요청 UI/UX 하드닝 및 CRUD 연결 워크플로우.
---

# page-care-upgrade

## Trigger
- /care 개선, 폴리싱, 실데이터 연결 요청 시

## Input Context
- Route: `/care`
- Page file: `frontend/src/app/(main)/care/page.tsx`
- Parity: DANG-B2B-001
- Priority: P2

## Read First
1. docs/status/PAGE-UPGRADE-BOARD.md
2. docs/status/SKILL-DOC-MATRIX.md
3. docs/status/PROJECT-STATUS.md
4. frontend/src/app/(main)/care/page.tsx

## Current State
- mock 돌봄 요청 데이터 사용
- useCareRequests 훅 미생성
- 돌봄자 선택 UI 미구현

## Target Files
| File | Role | Action |
|---|---|---|
| `frontend/src/app/(main)/care/page.tsx` | 돌봄 라우트 | Modify |
| `frontend/src/lib/hooks/useCare.ts` | 돌봄 훅 | Create |

## Schema Dependencies
| Table | Operations | Storage |
|---|---|---|
| `care_requests` | SELECT, INSERT, UPDATE, DELETE | — |
| `guardians` | SELECT (돌봄자 후보) | `dog-profiles` (아바타) |

## Do
1. 현재 갭을 board + parity 노트 기준으로 확인
2. 이 라우트와 직접 관련된 컴포넌트/훅으로만 스코프 제한
3. 결정적 loading/empty/error/success 상태 구현
4. docs/daily + board 상태 동기화

## Do Not
- 다른 라우트로 스코프 확장 금지
- 관련 없는 공유 아키텍처 리라이트 금지

## Implementation Runbook
1. **mock → useCareRequests CRUD** — `useCare.ts` 생성. 돌봄 요청 목록 조회, 생성, 수정, 삭제.
2. **돌봄 유형 필터** — walk(산책), sitting(돌봄), grooming(미용), hospital(병원) 탭.
3. **돌봄자 선택** — 매칭된 보호자 중 돌봄 가능한 유저 목록. 요청 전송.
4. **요청 상태 추적** — pending → accepted → completed 플로우.
5. **빈 상태** — 돌봄 요청 없을 때 "돌봄이 필요할 때 요청해보세요" 메시지.

## Validation
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npx next lint`
- 라우트 렌더링 에러 없음
- Board 행 업데이트 완료

## Acceptance Criteria
- 실 care_requests 데이터로 목록 표시
- 돌봄 요청 생성 → care_requests INSERT
- 돌봄 유형별 필터 동작
- 요청 상태 업데이트 반영

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
