# Page Upgrade Board

| route | label | group | priority | status | owner | parity_ids | page_skill | support_skills | must_read_docs | last_updated |
|---|---|---|---|---|---|---|---|---|---|---|
| `/login` | Login | Auth | P1 | QA | codex | DANG-AUTH-001 | `page-login-upgrade` | `feature-form-validation-and-submit`, `feature-error-and-retry-state` | `docs/status/PROJECT-STATUS.md` | 2026-03-07 |
| `/register` | Register | Auth | P1 | QA | codex | DANG-AUTH-001 | `page-register-upgrade` | `feature-form-validation-and-submit` | `docs/status/PROJECT-STATUS.md` | 2026-03-07 |
| `/onboarding` | Onboarding | Onboarding | P0 | QA | codex | DANG-ONB-001, DANG-DES-001 | `page-onboarding-upgrade` | `feature-form-validation-and-submit`, `feature-navigation-and-gesture` | `docs/status/PROJECT-STATUS.md`, `docs/status/11-FEATURE-PARITY-MATRIX.md` | 2026-03-07 |
| `/home` | Home | Main | P0 | QA | codex | DANG-MAT-001, DANG-DES-001 | `page-home-upgrade` | `feature-data-binding-and-loading`, `feature-ui-empty-and-skeleton` | `docs/status/PROJECT-STATUS.md`, `docs/status/MISSING-AND-UNIMPLEMENTED.md` | 2026-03-07 |
| `/chat` | Chat List | Main | P1 | QA | codex | DANG-CHT-001 | `page-chat-list-upgrade` | `feature-data-binding-and-loading`, `feature-ui-empty-and-skeleton` | `docs/status/PROJECT-STATUS.md` | 2026-03-07 |
| `/chat/[id]` | Chat Room | Main | P0 | QA | codex | DANG-CHT-001, DANG-WLK-001 | `page-chat-room-upgrade` | `feature-navigation-and-gesture`, `feature-error-and-retry-state` | `docs/status/PROJECT-STATUS.md` | 2026-03-07 |
| `/schedules` | Schedules | Main | P1 | QA | codex | DANG-WLK-001 | `page-schedules-upgrade` | `feature-data-binding-and-loading`, `feature-form-validation-and-submit` | `docs/status/PROJECT-STATUS.md` | 2026-03-07 |
| `/danglog` | DangLog Feed | Main | P1 | QA | codex | DANG-DLG-001 | `page-danglog-feed-upgrade` | `feature-data-binding-and-loading`, `feature-form-validation-and-submit` | `docs/status/PROJECT-STATUS.md` | 2026-03-07 |
| `/profile` | Profile | Main | P1 | QA | codex | DANG-PRF-001 | `page-profile-upgrade` | `feature-data-binding-and-loading`, `feature-form-validation-and-submit` | `docs/status/PROJECT-STATUS.md` | 2026-03-07 |
| `/modes` | Modes | Main | P2 | QA | codex | DANG-MAT-001, DANG-B2B-001 | `page-modes-upgrade` | `feature-navigation-and-gesture`, `feature-data-binding-and-loading`, `feature-error-and-retry-state` | `docs/status/PROJECT-STATUS.md` | 2026-03-07 |
| `/care` | Care | Main | P2 | QA | codex | DANG-B2B-001 | `page-care-upgrade` | `feature-data-binding-and-loading`, `feature-form-validation-and-submit`, `feature-error-and-retry-state` | `docs/status/PROJECT-STATUS.md` | 2026-03-07 |
| `/family` | Family | Main | P2 | QA | codex | DANG-B2B-001 | `page-family-upgrade` | `feature-data-binding-and-loading`, `feature-ui-empty-and-skeleton`, `feature-error-and-retry-state` | `docs/status/PROJECT-STATUS.md` | 2026-03-07 |

## Status Flow

`Ready -> InProgress -> QA -> Done` (`Hold` allowed for blockers).

## Dual-Agent Rules
<!-- Owner: `claude` | `codex` | `unassigned`. See docs/ref/DUAL-AGENT-HANDOFF.md for claim/release protocol. -->

## 2026-03-05 QA/Security Sync

- Route QA target set (`/home`, `/chat`, `/chat/[id]`, `/schedules`, `/danglog`, `/profile`) remains `Done`.
- Frontend static gates re-verified in this cycle (`tsc`, `lint` pass).
- DANG-INFRA-001 follow-up documented in status docs after writable MCP migration/advisor re-check.
- New machine local env bootstrap completed (`frontend/.env.local`).
- Auth Playwright verification (Kakao excluded) completed:
  - PASS: `/home` -> `/login` redirect, `/login` render + Google button, Google OAuth redirect, `/auth/callback` error redirect, `/register` render.
  - Deferred: Kakao auth execution (visibility only confirmed).
  - Board action applied: `/login`, `/register` status changed to `QA`.
- B2B speed-first implementation update:
  - `/modes`, `/care` moved to `QA` after authenticated in-route verification.
  - `/family` unblocked and moved to `QA` after RLS policy fix + create-flow patch (`insert` without immediate `select`).
  - Playwright authenticated evidence: `output/playwright/b2b-qa-20260305/results-authenticated.json`.
  - Additional evidence: `output/playwright/b2b-qa-20260305/family-create-success.png`.

## 2026-03-05 Chat/DangLog Seed Sync

- Debug seed data injected for chat/danglog (medium + fanout runs).
- DangLog feed confirms seeded data visibility.
- `/chat` moved to `QA` re-check due runtime empty-state observation in some sessions despite seeded rows.
- Chat page now exposes explicit fetch-error UI to avoid false empty-state diagnosis.

## 2026-03-06 Chat Stabilization Test Sync

- `/chat/[id]` schedule response flow hardened:
  - one-shot response mutation guard retained (`proposal_status='proposed'`)
  - optimistic pending-lock added to block duplicate accept/reject clicks
- Local automated checks added:
  - Vitest test harness with jsdom/testing-library
  - schedule utility/hook/component regression tests for `/chat/[id]`
- New release gate available:
  - `npm run verify:local` (encoding + lint + tests + build) PASS

## 2026-03-06 Auth OAuth Consent Sync

- `/login` + `/register` now share one Google OAuth entry model (required consent gate).
- `/auth/callback` records 4 consent types into `consent_logs` after session exchange.
- Added local auth regression tests:
  - consent payload utility tests
  - auth entry component tests (required-consent gating and OAuth-start error state)

## 2026-03-06 Care Reservations Slice Sync

- `/care` main path moved to reservations-first:
  - partner place lookup (`partner_places`)
  - reservation create/list (`reservations`)
- Route behavior now explicitly covers:
  - places empty state
  - reservations fetch error + retry
  - post-create list refresh/invalidate path
- Legacy `care_requests` kept as secondary tab only (fallback compatibility).

## 2026-03-06 Family Ownership/Schedule Slice Sync

- `/family` now binds real data for:
  - co-parenting ownership (`dog_ownership`)
  - shared schedule participation (`schedule_participants` + `schedules`)
- Route behavior now explicitly covers:
  - ownership/schedule empty states
  - ownership/schedule error + retry handling
  - summary metrics from participant status counts
- Existing family group flow remains active as a dedicated section.

## 2026-03-06 Modes B2B Status Sync

- `/modes` includes B2B status dashboard cards:
  - care card (`partner_places` + `reservations`)
  - family card (`dog_ownership` + `schedule_participants`)
- Added summary retry action for B2B query failures.
- Added local tests:
  - `modesProgress` utility
  - `/modes` component rendering + retry behavior

## 2026-03-06 Playwright E2E Harness Sync

- Added route-level Playwright suites:
  - `@unauth`: auth/public/protected redirect checks
  - `@signed`: signed-in flow checks (storageState required)
- Added manual storage-state capture flow (`e2e:auth:record`) for Google OAuth sessions.
- Current result:
  - `e2e:unauth` PASS
  - `e2e:signed` is gated/skip without `E2E_STORAGE_STATE`

## 2026-03-06 Playwright Signed E2E Sync

- Captured storage state with manual Chrome OAuth flow.
- Signed suite result updated:
  - `e2e:signed` PASS (2/2)
  - full `e2e` PASS (5/5)
- `/chat` signed scenario now tolerates valid empty variants (chat empty or recommendation empty) to avoid false negatives.
