# DangApp Project Status

Last Updated: 2026-03-06 (KST) manual update (chat/auth/family/modes + signed e2e)
Owner Doc: `CLAUDE.md`

## Execution Phases

| Phase | Status | Notes |
|---|---|---|
| Wave 0: workflow alignment | Done | docs/status + route board + skill matrix bootstrap completed. |
| Wave 1: schema foundation | Done | Schema phases 1-3 completed, core hardening applied, and Supabase function/storage foundations aligned for matching and location flows. |
| Wave 2: onboarding rebuild | Done | `/onboarding` rebuilt with RHF, Zod, Supabase hooks, and upload flow. Type modeling and mapper cleanup completed. |
4. ~~`match_guardians_v2` had 404 or wrong-result risk due to matching runtime and seed-data drift.~~ **[RESOLVED - 2026-03-04 matching runtime, seed alignment, and related function verification completed]**

| Wave 4: chat/schedule/walk | QA | `/schedules`, `/chat`, and `/chat/[id]` are in QA. Remaining work is focused on signed-in runtime verification and evidence capture. |
| Wave 5: danglog/profile/notice | QA | `/danglog` and `/profile` are in QA. Remaining work is focused on signed-in verification, cleanup, and evidence capture. |
| Wave 6: B2B partner flow | InProgress | `/care` reservations-first + `/family` ownership/schedule binding implemented, signed-in QA evidence pending |

## Wave Progress

| Wave | Parity IDs | Status | Progress |
|------|-----------|--------|----------|
| 0 | workflow | Done | 100% |
| 1 | DANG-INFRA-001 | Done | 100% |
| 2 | DANG-ONB-001 | Done | 100% |
| 3 | DANG-MAT-001, DANG-CHT-001 | QA | 75% |
| 4 | DANG-WLK-001, DANG-DLG-001, DANG-PRF-001 | QA | 75% |
| 5 | DANG-B2B-001 | InProgress | 65% |

Overall parity verification: 1 Verified / 10 active IDs = 10% (7 routes at QA ??58% implementation complete, verification pending)

## Active Parity IDs

| Parity ID | Domain | Status | Remaining |
|---|---|---|---|
| DANG-INFRA-001 | Schema/MCP/Storage/RLS | Done | ??|
| DANG-DES-001 | Toss-like design system | QA | route-level verification pending |
| DANG-AUTH-001 | auth + consent | InProgress | Google OAuth entry + callback consent logging implemented; Playwright unauth/signed auth-route checks PASS, final production OAuth evidence packaging pending |
| DANG-ONB-001 | guardian/dog onboarding | QA | end-to-end verification + edge-case testing |
| DANG-MAT-001 | matching + filters | InProgress | `/modes` B2B status summary added + Playwright route harness added (`@unauth`/`@signed` both PASS with storageState), integrated checklist expansion pending |
| DANG-CHT-001 | realtime chat + schedule | QA | chat RLS recursion hotfix + legacy scheduleId backfill + one-shot response guard + local regression tests completed; final signed-in E2E evidence |
| DANG-WLK-001 | walk records + review | QA | end-to-end verification pending |
| DANG-DLG-001 | collaborative danglog | QA | end-to-end verification pending |
| DANG-PRF-001 | profile/notification settings | QA | end-to-end verification pending |
| DANG-B2B-001 | partner-place model | InProgress | `/care` reservations-first flow completed + `/family` ownership/schedule binding completed; signed-in integration QA evidence pending |

## Blockers

1. ~~Core table RLS for existing schema is incomplete and must be hardened before production traffic.~~ **[RESOLVED - DANG-INFRA-001 Done: 65 RLS policies verified]**
2. ~~Onboarding UX spec has many fields requiring storage + schema support; this is Wave 1 dependency.~~ **[RESOLVED - Wave 1 Done: schema and storage policies applied]**
3. ~~MCP connection requires valid `SUPABASE_ACCESS_TOKEN` in runtime environment.~~ **[RESOLVED - 2026-03-04 access token verified and used for schema audit]**
4. ~~`match_guardians_v2` had 404 or wrong-result risk due to matching runtime and seed-data drift.~~ **[RESOLVED - 2026-03-04 matching runtime, seed alignment, and related function verification completed]**

## 2026-03-05 Execution Update (Codex)

- Supabase MCP reconnected in writable mode (current_user=postgres, transaction_read_only=off).
- Applied DB migration security_hardening_function_search_path_only successfully.
- Added app-owned SRID table via migration create_app_srid_catalog (seeded EPSG:4326, RLS enabled).
- Security Advisor re-run:
  - resolved: function_search_path_mutable (5 functions)
  - remaining: rls_disabled_in_public on public.spatial_ref_sys (owner: supabase_admin)
  - remaining (intentional): public.leads permissive policy warning
  - remaining (ops): auth_leaked_password_protection, extension_in_public(postgis)
- Frontend quality gates passed:
  - npx tsc --noEmit -p ./tsconfig.json
  - npm run lint
- New machine bootstrap completed:
  - frontend/.env.local created from project Supabase URL + anon key
  - optional OAuth keys (Kakao) left blank for local opt-in setup
- Route QA board for /home, /chat, /chat/[id], /schedules, /danglog, /profile remains Done.

## 2026-03-05 Auth QA Update (Playwright, Kakao Excluded)

- Scope: verification only (no code/DB/API/type change).
- Evidence: `output/playwright/auth-qa-20260305-p3100/results.json`.
- PASS:
  - unauth `/home` -> `/login` redirect
  - `/login` render + Google button visibility
  - Google OAuth redirect to provider authorize URL
  - `/auth/callback` without code -> `/login?error=auth-code-error`
  - `/register` render and form entry
- Deferred:
  - Kakao auth execution (visibility only; full flow excluded this cycle).
- Board sync:
  - `/login`, `/register` status moved to `QA`.

## 2026-03-05 B2B Speed-First Update (Codex)

- Implemented speed-first hardening for `/modes`, `/care`, `/family`:
  - reduced animation overhead + `prefers-reduced-motion` support
  - route-level query tuning (stale/refetch policy)
  - optimistic create + rollback for care requests and family groups
  - caregiver selection requirement added (empty `caregiver_id` submit path removed)
- Static quality gates passed:
  - `npx tsc --noEmit -p ./tsconfig.json`
  - `npm run lint`
- Playwright evidence captured:
  - `output/playwright/b2b-qa-20260305/results.json`
- QA status:
  - unauth protected-route and speed checks passed (`/modes|/care|/family` -> `/login`)
  - authenticated in-route QA completed with split result:
    - PASS: `/modes`, `/care`
    - FAIL/BLOCKED: `/family` (Supabase REST 500 on `family_members`, `family_groups`)

## 2026-03-05 B2B Authenticated QA Sync

- Evidence:
  - `output/playwright/b2b-qa-20260305/results-authenticated.json`
- Route outcome:
  - `/modes` -> `QA`
  - `/care` -> `QA`
  - `/family` -> `Hold` (reproducible backend 500)
- Repro endpoints:
  - `GET /rest/v1/family_members?select=group_id&member_id=...` -> 500
  - `POST /rest/v1/family_groups?select=*` -> 500

## 2026-03-05 B2B Family Unblock Update (Codex)

- Backend fix applied:
  - remote migration `supabase/migrations/20260305133000_fix_family_rls_recursion.sql`
  - removed recursive `family_members` policy path (`42P17` issue)
- Frontend fix applied:
  - `frontend/src/lib/hooks/useMode.ts`
  - `useCreateFamilyGroup`: changed to client UUID + insert without immediate `.select()`
  - `useFamilyMembers`: skip optimistic IDs (`optimistic-*`) to avoid transient 400 requests
- Re-validation:
  - `/family` group create succeeds
  - created groups persist after refresh
  - console has no `/family_groups?select=*` 403 and no optimistic-member 400 after patch
  - evidence: `output/playwright/b2b-qa-20260305/family-create-success.png`
- Board sync:
  - `/family` status updated from `Hold` to `QA`

## 2026-03-05 Chat/DangLog Debug Seed + Handoff Update (Codex)

- Implemented seed tooling for debug data:
  - `scripts/seed-chat-danglog-debug.mjs`
  - `scripts/cleanup-chat-danglog-debug.mjs`
  - `scripts/check-chat-danglog-debug.mjs`
  - root `package.json` scripts: `seed:debug`, `seed:cleanup`, `seed:check`
- Security hardening:
  - `scripts/seed-scenarios.mjs` rewritten to env-only (hardcoded service key removed)
- Runtime seeding status:
  - initial run PASS (`rooms=2`, `messages=20`, `danglogs=10`)
  - fanout run PASS for all guardians (`chat_rooms=12`, `chat_messages=120`, `danglogs=60`)
- UI/runtime observation:
  - DangLog feed shows seeded records
  - Chat list still empty in some user sessions despite seeded participant rows
  - chat page updated to show explicit fetch-error UI (avoid empty-state masking)
- Handoff next action (Claude):
  - verify active session user -> `useCurrentGuardian()` -> `guardian.id` mapping
  - trace `/chat` query result path in runtime for the same session

## 2026-03-06 Chat Stabilization + Local Verify Update (Codex)

- Local verification pipeline standardized at root:
  - `npm run verify:local` -> `check:encoding -> lint -> test:run -> build`
  - root scripts added: `test`, `test:run`, `verify:local`
- Frontend test harness introduced:
  - `vitest + jsdom + testing-library` configured (`frontend/vitest.config.ts`, `frontend/vitest.setup.ts`)
- Chat/schedule hardening update:
  - schedule response state parsing moved to pure utility
  - response mutation error normalized to domain codes (`ALREADY_RESPONDED`, `FORBIDDEN`, `UNKNOWN`)
  - `/chat/[id]` schedule action buttons now optimistic-lock on first click to prevent duplicate PATCH races
- Automated regression coverage added:
  - schedule response utility tests (10)
  - `useRespondSchedule` hook tests (4)
  - `/chat/[id]` schedule card rendering/action tests (2)
- Quality gate result:
  - `npm run verify:local` PASS on 2026-03-06 (KST)

## 2026-03-06 Auth OAuth + Consent Callback Update (Codex)

- `/login` + `/register` flow unified around Google OAuth entry:
  - required consents (`terms`, `privacy`) + optional consents (`location`, `marketing`) added
  - Google CTA disabled until required consents are checked
  - consent payload stored in short-lived cookie before OAuth redirect
- `/auth/callback` hardened:
  - exchange code -> session
  - validate consent cookie + required consents
  - insert 4 `consent_logs` rows (`terms/privacy/location/marketing`) with metadata
  - on consent missing/insert failure: sign out and redirect to `/login?error=...`
- Added local regression coverage:
  - auth consent utility tests
  - auth entry component tests (required-consent gate + OAuth start failure state)
- Quality gate result:
  - `npm run verify:local` PASS after auth update (2026-03-06 KST)

## 2026-03-06 Care Reservations Vertical Slice Update (Codex)

- `/care` default flow switched from legacy `care_requests` to `partner_places` + `reservations`.
- Added dedicated hooks:
  - `usePartnerPlaces`
  - `useMyReservations`
  - `useCreateReservation`
- Added view-model utilities:
  - place mapping (`place_id -> placeName`)
  - reservation input validation (`guest_count >= 1`, datetime format)
- UI behavior:
  - partner place loading/error/empty states
  - reservation create form (`place_id`, `reserved_at`, `guest_count`, `request_memo`, optional `dog_id`)
  - reservation list status badges (`pending/confirmed/completed/cancelled`)
  - legacy `care_requests` remains as secondary fallback tab
- Local verification evidence (2026-03-06 KST):
  - `npm run test:run --prefix frontend` PASS (`8 files / 37 tests`)
  - `npm run lint --prefix frontend` PASS
  - `npm run build --prefix frontend` PASS
  - `npm run verify:local` PASS

## 2026-03-06 Family Ownership + Shared Schedule Slice Update (Codex)

- `/family` page upgraded to real-data overview:
  - `dog_ownership` binding for co-parenting dog list
  - `schedule_participants` + `schedules` binding for shared schedule participation list
  - group management flow kept (`family_groups` + `family_members`)
- Added dedicated family hooks:
  - `useDogOwnerships`
  - `useMyScheduleParticipants`
  - `useFamilySharedSchedules`
- Added pure utilities:
  - dog ownership name mapping (`dog_id -> dogName`)
  - participant status metrics summary
- Added local regression coverage:
  - family utility tests (3)
  - family hook tests (3)
  - `/family` component tests (3)
- Local verification evidence (2026-03-06 KST):
  - `npm run test:run --prefix frontend` PASS (`11 files / 46 tests`)
  - `npm run lint --prefix frontend` PASS
  - `npm run build --prefix frontend` PASS
  - `npm run verify:local` PASS

## 2026-03-06 Modes B2B Status Dashboard Update (Codex)

- `/modes` now shows B2B execution status cards for `care` and `family`:
  - live counts from `partner_places`, `reservations`, `dog_ownership`, `schedule_participants`
  - explicit summary tone (`good/neutral/warning`) via pure helper
  - route links to `/care` and `/family`
  - combined retry action for B2B summary queries
- Added local regression coverage:
  - `modesProgress` utility tests (4)
  - `/modes` component tests (3)
- Local verification evidence (2026-03-06 KST):
  - `npm run test:run --prefix frontend` PASS (`13 files / 53 tests`)
  - `npm run lint --prefix frontend` PASS
  - `npm run build --prefix frontend` PASS
  - `npm run verify:local` PASS

## 2026-03-06 Playwright Route E2E Harness Update (Codex)

- Added Playwright runner/config for route QA:
  - config: `frontend/playwright.config.ts`
  - tests: `frontend/e2e/routes.public.spec.ts`, `frontend/e2e/routes.signed.spec.ts`
  - manual storage-state recorder: `frontend/e2e/auth-record.spec.ts`
  - local folder guide: `frontend/e2e/claude.md`
- Added scripts:
  - root: `e2e`, `e2e:unauth`, `e2e:signed`, `e2e:auth:record`, `e2e:report`, `e2e:install`
  - frontend: same commands
- Execution result (2026-03-06 KST):
  - `npm run e2e:unauth --prefix frontend` PASS (3/3)
  - `npm run e2e:signed --prefix frontend` SKIP (2 skipped, `E2E_STORAGE_STATE` missing)
  - `npm run e2e --prefix frontend` PASS (3 passed / 2 skipped)

## 2026-03-06 Playwright Signed Storage-State Verification Update (Codex)

- Captured signed browser session storage state via:
  - `npm run e2e:auth:record --prefix frontend` PASS
- Signed suite executed with `E2E_STORAGE_STATE`:
  - `npm run e2e:signed --prefix frontend` PASS (2/2)
  - `npm run e2e --prefix frontend` PASS (5/5)
- Signed flow coverage now includes:
  - main protected routes no-login-bounce check
  - chat route branch handling (room detail or valid empty/recommendation state)
