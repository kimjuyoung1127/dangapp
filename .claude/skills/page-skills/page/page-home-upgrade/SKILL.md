---
name: page-home-upgrade
description: /home UI/UX 하드닝 및 매칭 기능 완성 워크플로우.
---

# page-home-upgrade

## Trigger
- /home 개선, 폴리싱, 실데이터 연결 요청 시
- 매칭 카드 UI 및 Like/Pass 기능 연결 시

## Input Context
- Route: `/home`
- Page file: `frontend/src/app/(main)/home/page.tsx`
- Parity: DANG-MAT-001
- Priority: P0

## Read First
1. docs/status/PAGE-UPGRADE-BOARD.md
2. docs/status/SKILL-DOC-MATRIX.md
3. docs/status/PROJECT-STATUS.md
4. frontend/src/app/(main)/home/page.tsx
5. frontend/src/components/features/match/MatchCard.tsx
6. frontend/src/lib/hooks/useMatch.ts

## Current State
- Mock 데이터 + setTimeout(1500) 로딩 시뮬레이션
- useMatch 훅 존재하나 페이지에 연결 안됨
- MatchCard에 하드코딩된 mock props
- Like/Pass 액션 미연결
- relation_purpose 필터 없음

## Target Files
| File | Role | Action |
|---|---|---|
| `frontend/src/app/(main)/home/page.tsx` | 홈 라우트 | Modify |
| `frontend/src/components/features/match/MatchCard.tsx` | 매칭 카드 | Modify |
| `frontend/src/lib/hooks/useMatch.ts` | 매칭 훅 | Modify |

## Schema Dependencies
| Table | Operations | Storage |
|---|---|---|
| `guardians` | SELECT (RPC 매칭 후보) | — |
| `dogs` | SELECT (반려견 정보) | `dog-profiles` (사진) |
| `matches` | INSERT (like/pass 액션) | — |

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
1. **`useMatchingGuardians()` 훅을 페이지에 연결** — useState+setTimeout 패턴을 hook의 `useQuery` 결과로 교체.
2. **MatchCard에 실 데이터 props 전달** — guardian + dog 조인 데이터를 카드 props로 매핑.
3. **Like/Pass → `useCreateMatchAction.mutate()` 연결** — matches 테이블에 INSERT. status: 'liked' | 'passed'.
4. **relation_purpose 필터 탭 UI 추가** — 산책친구/놀이친구/돌봄 필터. 훅 파라미터로 전달.
5. **빈 상태 UI** — 매칭 대상 없을 때 "주변에 새로운 친구가 없어요" 메시지 + 필터 변경 제안.
6. **미완성 프로필 배너** — onboarding_progress < 100일 때 프로필 완성 유도 배너 표시.

## Validation
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npx next lint`
- 라우트 렌더링 에러 없음
- Loading/empty/error 상태 시각적 일관성
- API/데이터 바인딩이 예상 계약과 일치
- Board 행 업데이트 완료

## P0 Additional Checks
- 데이터 없는 레이아웃이 실 데이터 로드 전에 존재
- Skeleton → 실 데이터 전환이 깨끗함
- 카드 스와이프/탭 터치 타깃 충분 (44px 이상)
- 새로고침 시 데이터 신선도 표시

## Acceptance Criteria
- 실 guardian+dog 데이터로 카드 로드
- Like → matches 행 생성 (status: 'liked')
- Pass → matches 행 생성 (status: 'passed')
- relation_purpose 필터로 카드 필터링 동작
- 빈 상태 UI가 매칭 대상 0명일 때 표시
- 상호 like → 매칭 성사 알림 (또는 TODO 마킹)

## Forbidden
- MOCK_* 상수 최종 코드에 남기지 않음
- setTimeout 로딩 시뮬레이션 금지
- 페이지에서 직접 supabase.from() 금지 (SKILL-05)
- 인라인 className 조건 금지 (SKILL-01/02)

## Output Template
- Scope: DANG-MAT-001
- Files:
- Validation:
- Daily Sync:
- Risks:
- Self-Review:
- Next Recommendations:
