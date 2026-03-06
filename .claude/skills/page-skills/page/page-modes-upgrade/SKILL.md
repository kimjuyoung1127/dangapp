---
name: page-modes-upgrade
description: /modes UI/UX 하드닝 및 모드 잠금해제 연결 워크플로우.
---

# page-modes-upgrade

## Trigger
- /modes 개선, 폴리싱, 실데이터 연결 요청 시

## Input Context
- Route: `/modes`
- Page file: `frontend/src/app/(main)/modes/page.tsx`
- Parity: DANG-MAT-001, DANG-B2B-001
- Priority: P2

## Read First
1. docs/status/PAGE-UPGRADE-BOARD.md
2. docs/status/SKILL-DOC-MATRIX.md
3. docs/status/PROJECT-STATUS.md
4. frontend/src/app/(main)/modes/page.tsx
5. frontend/src/stores/useModeStore.ts

## Current State
- mock unlock 데이터 사용
- useModeUnlocks 훅 미연결
- 신뢰 점수 기반 잠금해제 로직 mock

## Target Files
| File | Role | Action |
|---|---|---|
| `frontend/src/app/(main)/modes/page.tsx` | 모드 라우트 | Modify |
| `frontend/src/stores/useModeStore.ts` | 모드 스토어 | Modify |
| `frontend/src/lib/hooks/useMode.ts` | 모드 훅 | Modify |

## Schema Dependencies
| Table | Operations | Storage |
|---|---|---|
| `mode_unlocks` | SELECT (잠금해제 상태) | — |
| `users` | SELECT (trust_score 조회) | — |

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
1. **mock unlock → useModeUnlocks 연결** — mode_unlocks 테이블에서 현재 유저의 잠금해제 상태 조회.
2. **실 신뢰 점수 연결** — users.trust_score로 잠금해제 조건 계산.
3. **모드별 잠금 UI** — basic(기본)/care(돌봄)/family(가족) 모드. 잠금 상태면 잠금 아이콘 + 해제 조건 안내.
4. **잠금해제 프로그레스** — 현재 신뢰 점수 대비 해제 필요 점수 진행률 표시.
5. **B2B 확장 포인트 마킹** — 향후 파트너 모드 추가를 위한 확장 구조. TODO 주석.

## Validation
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npx next lint`
- 라우트 렌더링 에러 없음
- Board 행 업데이트 완료

## Acceptance Criteria
- mode_unlocks 실 데이터로 잠금 상태 표시
- 신뢰 점수 기반 잠금해제 조건 정확
- 잠금된 모드 클릭 시 해제 조건 안내
- 해제된 모드 클릭 시 해당 기능으로 이동

## Forbidden
- MOCK_* 상수 최종 코드에 남기지 않음
- setTimeout 로딩 시뮬레이션 금지
- 페이지에서 직접 supabase.from() 금지 (SKILL-05)
- 인라인 className 조건 금지 (SKILL-01/02)

## Output Template
- Scope: DANG-MAT-001, DANG-B2B-001
- Files:
- Validation:
- Daily Sync:
- Risks:
- Self-Review:
- Next Recommendations:
