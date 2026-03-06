---
name: page-profile-upgrade
description: /profile UI/UX 하드닝 및 프로필 편집 + 알림 세팅 워크플로우.
---

# page-profile-upgrade

## Trigger
- /profile 개선, 폴리싱, 실데이터 연결 요청 시
- 반려견/보호자 프로필 편집 및 알림 설정 구현 시

## Input Context
- Route: `/profile`
- Page file: `frontend/src/app/(main)/profile/page.tsx`
- Parity: DANG-PRF-001
- Priority: P1

## Read First
1. docs/status/PAGE-UPGRADE-BOARD.md
2. docs/status/SKILL-DOC-MATRIX.md
3. docs/status/PROJECT-STATUS.md
4. frontend/src/app/(main)/profile/page.tsx

## Current State
- mock 프로필 데이터 사용
- useProfile 훅 미생성
- 프로필 편집 폼 미구현
- 알림 세팅 미구현
- 신뢰 뱃지 mock 표시

## Target Files
| File | Role | Action |
|---|---|---|
| `frontend/src/app/(main)/profile/page.tsx` | 프로필 라우트 | Modify |
| `frontend/src/lib/hooks/useProfile.ts` | 프로필 훅 | Create |
| `frontend/src/components/features/profile/EditProfileForm.tsx` | 프로필 편집 폼 | Create |
| `frontend/src/components/features/profile/NotificationSettings.tsx` | 알림 세팅 | Create |

## Schema Dependencies
| Table | Operations | Storage |
|---|---|---|
| `guardians` | SELECT, UPDATE (프로필 편집) | — |
| `dogs` | SELECT, UPDATE (반려견 편집) | `dog-profiles` (사진) |
| `notification_settings` | SELECT, UPDATE (알림 on/off) | — |
| `trust_badges` | SELECT (신뢰 뱃지) | — |

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
1. **mock → useProfile 연결** — `useProfile.ts` 생성. `useGuardianProfile()`, `useDogProfile()` 쿼리 훅.
2. **보호자 프로필 편집 폼** — `EditProfileForm` 컴포넌트. 닉네임, 소개, 아바타, 활동시간 수정. Zod + RHF 패턴.
3. **반려견 프로필 편집** — 이름, 견종, 나이, 체중, 성격, 사진 수정. 멀티 반려견 지원 (dogs 테이블).
4. **알림 세팅** — `NotificationSettings` 컴포넌트. 채팅/약속/댕로그/마케팅 on/off 토글. notification_settings CRUD.
5. **신뢰 뱃지** — trust_badges 실 데이터로 표시. TrustBadge 컴포넌트 (SKILL-08) 사용.
6. **온보딩 미완성 배너** — onboarding_progress < 100이면 "프로필을 완성해보세요" 배너 + 미완성 항목 안내.

## Validation
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npx next lint`
- 라우트 렌더링 에러 없음
- Loading/empty/error 상태 시각적 일관성
- Board 행 업데이트 완료

## Acceptance Criteria
- 실 guardian+dog 데이터로 프로필 표시
- 보호자 정보 편집 → guardians UPDATE 반영
- 반려견 정보 편집 → dogs UPDATE 반영
- 알림 세팅 토글 → notification_settings 반영
- 신뢰 뱃지가 trust_badges 실 데이터로 표시
- 온보딩 미완성 시 완성 유도 배너 표시

## Forbidden
- MOCK_* 상수 최종 코드에 남기지 않음
- setTimeout 로딩 시뮬레이션 금지
- 페이지에서 직접 supabase.from() 금지 (SKILL-05)
- 인라인 className 조건 금지 (SKILL-01/02)

## Output Template
- Scope: DANG-PRF-001
- Files:
- Validation:
- Daily Sync:
- Risks:
- Self-Review:
- Next Recommendations:
