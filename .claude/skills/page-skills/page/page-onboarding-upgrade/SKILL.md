---
name: page-onboarding-upgrade
description: /onboarding UI/UX 하드닝 및 기능 완성 워크플로우. 프로그레시브 온보딩으로 진입장벽 완화.
---

# page-onboarding-upgrade

## Trigger
- /onboarding 개선, 폴리싱, 실데이터 연결 요청 시
- 온보딩 UX 진입장벽 완화 작업 시

## Input Context
- Route: `/onboarding`
- Page file: `frontend/src/app/(auth)/onboarding/page.tsx`
- Parity: DANG-ONB-001
- Priority: P0

## Read First
1. docs/status/PAGE-UPGRADE-BOARD.md
2. docs/status/SKILL-DOC-MATRIX.md
3. docs/status/PROJECT-STATUS.md
4. frontend/src/app/(auth)/onboarding/page.tsx
5. frontend/src/components/features/onboarding/Step1Guardian.tsx ~ Step7ActivityTimes.tsx
6. frontend/src/stores/useOnboardingStore.ts

## Current State
- 7단계 Zustand 폼 (Step1~7) 구현됨
- DB 영속화 없음 — Zustand 로컬 상태만 유지
- 스토리지 업로드 없음 — DogPhoto 스텝이 시각만 존재
- 모든 필드가 필수 입력으로 되어 있어 진입장벽 높음
- consent_logs 미연결

## Target Files
| File | Role | Action |
|---|---|---|
| `frontend/src/app/(auth)/onboarding/page.tsx` | 온보딩 라우트 | Modify |
| `frontend/src/components/features/onboarding/Step1Guardian.tsx` | 보호자 정보 | Modify |
| `frontend/src/components/features/onboarding/Step2DogInfo.tsx` | 반려견 기본정보 | Modify |
| `frontend/src/components/features/onboarding/Step3DogDetails.tsx` | 반려견 상세 | Modify |
| `frontend/src/components/features/onboarding/Step4DogTemperament.tsx` | 성격 프로필 | Modify |
| `frontend/src/components/features/onboarding/Step5DogPhoto.tsx` | 반려견 사진 | Modify |
| `frontend/src/components/features/onboarding/Step6Location.tsx` | 동네 설정 | Modify |
| `frontend/src/components/features/onboarding/Step7ActivityTimes.tsx` | 활동시간 | Modify |
| `frontend/src/stores/useOnboardingStore.ts` | Zustand 스토어 | Modify |
| `frontend/src/lib/hooks/useOnboarding.ts` | 온보딩 뮤테이션 훅 | Create |

## Schema Dependencies
| Table | Operations | Storage |
|---|---|---|
| `guardians` | INSERT (신규), UPDATE (프로필 완성) | — |
| `dogs` | INSERT (신규) | — |
| `consent_logs` | INSERT (약관 동의) | — |
| — | — | `dog-profiles` 버킷 (사진 업로드) |
| — | — | `dog-documents` 버킷 (접종 문서) |

## Do
1. 현재 갭을 board + parity 노트 기준으로 확인
2. 이 라우트와 직접 관련된 컴포넌트/훅으로만 스코프 제한
3. 결정적 loading/empty/error/success 상태 구현
4. 토큰 + 기존 공유 컴포넌트 재사용
5. Supabase MCP로 테이블/RLS 검증
6. docs/daily + board 상태 동기화
7. **진입장벽 완화**: 필수 입력을 최소화 (닉네임 + 반려견 이름 + 동네)

## Do Not
- 다른 라우트로 스코프 확장 금지
- 관련 없는 공유 아키텍처 리라이트 금지
- mock 동작 도입 시 명시적 TODO 없이 금지

## Implementation Runbook
1. **`useOnboarding.ts` 생성** — `useSubmitOnboarding()` TanStack Query 뮤테이션 훅. guardian INSERT + dog INSERT + consent_logs INSERT를 단일 트랜잭션으로.
2. **Step별 Zod 스키마 추가** — SKILL-07 (Form Step) 패턴. 필수 3개 필드(닉네임, 개이름, 동네)는 `.required()`, 나머지는 `.optional()`.
3. **Step5 DogPhoto → `dog-profiles` 버킷 업로드 연결** — 선택 사항. Supabase Storage `upload()` → URL을 `dogs.photo_urls`에 저장.
4. **Step7 제출 → guardian + dog 행 생성** — `useSubmitOnboarding.mutate()` 호출. `onboarding_progress` 계산하여 저장.
5. **consent_logs에 약관 동의 기록** — 동의 타입별 (privacy, terms, location, marketing) INSERT.
6. **완료 후 `/home` 리다이렉트** — `canExplore()` 게이트 = 닉네임 + 개이름 + 동네 3개 필드 기준.
7. **미완성 프로필 완성 유도** — onboarding_progress < 100일 때 홈/프로필에서 배너 표시 (이 스킬에서는 데이터만 설정, 배너 UI는 page-home/profile 스킬 관할).

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
- 액션 컨트롤의 터치 타깃 충분 (44px 이상)
- 스텝 전환 애니메이션이 부드러움

## Acceptance Criteria
- 최소 3필드(닉네임+개이름+동네)로 `/home` 탐색 가능
- 전체 완성 시 onboarding_progress = 100
- 선택 필드 스킵 가능하며 나중에 프로필에서 완성 가능
- consent_logs에 동의 기록이 정확히 저장됨
- 사진 업로드 시 `dog-profiles` 버킷에 파일 존재

## Forbidden
- MOCK_* 상수 최종 코드에 남기지 않음
- setTimeout 로딩 시뮬레이션 금지
- 페이지에서 직접 supabase.from() 금지 (SKILL-05)
- 인라인 className 조건 금지 (SKILL-01/02)

## Output Template
- Scope: DANG-ONB-001
- Files:
- Validation:
- Daily Sync:
- Risks:
- Self-Review:
- Next Recommendations:
