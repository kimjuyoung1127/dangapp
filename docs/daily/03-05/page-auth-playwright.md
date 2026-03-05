# 03-05 Auth Playwright QA (Kakao Excluded)

## Scope
- DANG-AUTH-001 verification only (no code/DB/API/type changes)
- Google OAuth redirect and auth routing checks
- Kakao flow marked as deferred for next cycle

## Preconditions
- `frontend/.env.local` configured
- dev server running at `http://localhost:3100`
- Playwright CLI evidence path:
  - `output/playwright/auth-qa-20260305-p3100/.playwright-cli/`

## Scenarios
1. Unauthenticated access to `/home` redirects to `/login` -> PASS
2. `/login` renders and shows Google button -> PASS
3. Google button redirects to authorize URL (`provider=google`) -> PASS
4. Access `/auth/callback` without `code` redirects to `/login?error=auth-code-error` -> PASS
5. `/register` renders and form is reachable -> PASS
6. Kakao button visibility only -> CONFIRMED (Deferred: Kakao auth)

## Evidence
- Result summary:
  - `output/playwright/auth-qa-20260305-p3100/results.json`
- Key snapshots:
  - `.playwright-cli/page-2026-03-05T02-58-42-795Z.yml` (`/login` button visibility)
  - `.playwright-cli/page-2026-03-05T02-58-45-605Z.yml` (Google OAuth redirect state)
  - `.playwright-cli/page-2026-03-05T02-58-48-949Z.yml` (`/auth/callback` error redirect)
  - `.playwright-cli/page-2026-03-05T02-58-51-675Z.yml` (`/register` form render)

## Decision
- Verification gate passed for:
  - protected-route redirect
  - login render + Google OAuth redirect
  - callback error routing
  - register render
- Board action rule:
  - `/login`, `/register` recorded as `Ready -> QA` transition candidates.
  - Keep current status as `Ready` until full auth implementation cycle starts.

