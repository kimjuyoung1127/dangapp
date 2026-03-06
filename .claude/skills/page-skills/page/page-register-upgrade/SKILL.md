---
name: page-register-upgrade
description: /register UI/UX 하드닝 및 회원가입 Auth 연결 워크플로우.
---

# page-register-upgrade

## Trigger
- /register 개선, 폴리싱, Auth OTP 연결 요청 시

## Input Context
- Route: `/register`
- Page file: `frontend/src/app/(auth)/register/page.tsx`
- Parity: DANG-AUTH-001
- Priority: P1

## Read First
1. docs/status/PAGE-UPGRADE-BOARD.md
2. docs/status/SKILL-DOC-MATRIX.md
3. docs/status/PROJECT-STATUS.md
4. frontend/src/app/(auth)/register/page.tsx

## Current State
- 기본 회원가입 UI 존재
- Auth OTP 미연결
- 동의 체크박스 UI만 존재, consent_logs 미연결
- 가입 후 → /onboarding 리다이렉트 미구현

## Target Files
| File | Role | Action |
|---|---|---|
| `frontend/src/app/(auth)/register/page.tsx` | 회원가입 라우트 | Modify |
| `frontend/src/lib/supabase/client.ts` | Supabase 클라이언트 | Verify |

## Schema Dependencies
| Table | Operations | Storage |
|---|---|---|
| `users` | INSERT (auth.signUp) | — |
| `consent_logs` | INSERT (약관 동의) | — |

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
1. **Auth OTP 연결** — `auth.signUp({ email, password })` 또는 OTP 기반 가입. 이메일 인증 코드 입력 UI.
2. **동의 체크박스 → consent_logs** — 필수(terms, privacy) + 선택(marketing, location) 체크박스. 체크 상태를 consent_logs에 INSERT.
3. **가입 후 → /onboarding 리다이렉트** — auth 콜백 처리 후 신규 유저는 /onboarding으로.
4. **Zod 유효성 검증** — 이메일 형식, 비밀번호 강도, 동의 필수 항목 체크.
5. **에러/로딩 상태** — 중복 이메일, 네트워크 에러, 가입 진행 중 로딩.

## Validation
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npx next lint`
- 라우트 렌더링 에러 없음
- Loading/empty/error 상태 시각적 일관성
- Board 행 업데이트 완료

## Acceptance Criteria
- 이메일/비밀번호 가입 성공
- 필수 동의 미체크 시 가입 불가
- consent_logs에 체크 상태 정확히 저장
- 가입 후 /onboarding으로 자동 리다이렉트
- 중복 이메일 시 명확한 에러 메시지

## Forbidden
- MOCK_* 상수 최종 코드에 남기지 않음
- setTimeout 로딩 시뮬레이션 금지
- 페이지에서 직접 supabase.from() 금지 (SKILL-05)
- 인라인 className 조건 금지 (SKILL-01/02)

## Output Template
- Scope: DANG-AUTH-001
- Files:
- Validation:
- Daily Sync:
- Risks:
- Self-Review:
- Next Recommendations:
