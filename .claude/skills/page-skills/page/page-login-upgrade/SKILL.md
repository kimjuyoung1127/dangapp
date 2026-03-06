---
name: page-login-upgrade
description: /login UI/UX 하드닝 및 Auth 연결 워크플로우.
---

# page-login-upgrade

## Trigger
- /login 개선, 폴리싱, Auth 실연결 요청 시

## Input Context
- Route: `/login`
- Page file: `frontend/src/app/(auth)/login/page.tsx`
- Parity: DANG-AUTH-001
- Priority: P1

## Read First
1. docs/status/PAGE-UPGRADE-BOARD.md
2. docs/status/SKILL-DOC-MATRIX.md
3. docs/status/PROJECT-STATUS.md
4. frontend/src/app/(auth)/login/page.tsx

## Current State
- 기본 로그인 UI 존재
- Auth magic link 미연결
- consent_logs 미연결
- dev redirect 하드코딩 존재

## Target Files
| File | Role | Action |
|---|---|---|
| `frontend/src/app/(auth)/login/page.tsx` | 로그인 라우트 | Modify |
| `frontend/src/lib/supabase/client.ts` | Supabase 클라이언트 | Verify |

## Schema Dependencies
| Table | Operations | Storage |
|---|---|---|
| `users` | SELECT (auth 확인) | — |
| `consent_logs` | INSERT (로그인 시 약관 동의) | — |

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
1. **Auth magic link 연결** — Supabase `auth.signInWithOtp({ email })` 연결. 이메일 전송 후 "메일을 확인해주세요" 피드백.
2. **consent_logs 연결** — 로그인 시 필수 약관(terms, privacy) 동의 확인 후 consent_logs INSERT.
3. **dev redirect 제거** — 하드코딩된 개발용 리다이렉트 로직 제거. auth callback으로 교체.
4. **에러 상태 처리** — 잘못된 이메일, 네트워크 에러, rate limit 피드백.
5. **로딩 상태** — 이메일 전송 중 버튼 disabled + 로딩 인디케이터.

## Validation
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npx next lint`
- 라우트 렌더링 에러 없음
- Loading/empty/error 상태 시각적 일관성
- Board 행 업데이트 완료

## Acceptance Criteria
- Magic link 이메일 전송 성공
- 잘못된 이메일 시 에러 메시지 표시
- consent_logs에 동의 기록 저장
- dev redirect 완전 제거
- 인증 후 적절한 라우트로 리다이렉트 (/onboarding 또는 /home)

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
