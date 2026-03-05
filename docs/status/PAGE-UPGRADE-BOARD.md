# Page Upgrade Board

| route | label | group | priority | status | owner | parity_ids | page_skill | support_skills | must_read_docs | last_updated |
|---|---|---|---|---|---|---|---|---|---|---|
| `/login` | Login | Auth | P1 | QA | unassigned | DANG-AUTH-001 | `page-login-upgrade` | `feature-form-validation-and-submit`, `feature-error-and-retry-state` | `docs/status/PROJECT-STATUS.md` | 2026-03-05 |
| `/register` | Register | Auth | P1 | QA | unassigned | DANG-AUTH-001 | `page-register-upgrade` | `feature-form-validation-and-submit` | `docs/status/PROJECT-STATUS.md` | 2026-03-05 |
| `/onboarding` | Onboarding | Onboarding | P0 | Done | claude | DANG-ONB-001, DANG-DES-001 | `page-onboarding-upgrade` | `feature-form-validation-and-submit`, `feature-navigation-and-gesture` | `docs/status/PROJECT-STATUS.md`, `docs/status/11-FEATURE-PARITY-MATRIX.md` | 2026-03-04 |
| `/home` | Home | Main | P0 | Done | claude | DANG-MAT-001, DANG-DES-001 | `page-home-upgrade` | `feature-data-binding-and-loading`, `feature-ui-empty-and-skeleton` | `docs/status/PROJECT-STATUS.md`, `docs/status/MISSING-AND-UNIMPLEMENTED.md` | 2026-03-05 |
| `/chat` | Chat List | Main | P1 | QA | claude | DANG-CHT-001 | `page-chat-list-upgrade` | `feature-data-binding-and-loading`, `feature-ui-empty-and-skeleton` | `docs/status/PROJECT-STATUS.md` | 2026-03-05 |
| `/chat/[id]` | Chat Room | Main | P0 | Done | claude | DANG-CHT-001, DANG-WLK-001 | `page-chat-room-upgrade` | `feature-navigation-and-gesture`, `feature-error-and-retry-state` | `docs/status/PROJECT-STATUS.md` | 2026-03-05 |
| `/schedules` | Schedules | Main | P1 | Done | claude | DANG-WLK-001 | `page-schedules-upgrade` | `feature-data-binding-and-loading`, `feature-form-validation-and-submit` | `docs/status/PROJECT-STATUS.md` | 2026-03-05 |
| `/danglog` | DangLog Feed | Main | P1 | Done | claude | DANG-DLG-001 | `page-danglog-feed-upgrade` | `feature-data-binding-and-loading`, `feature-form-validation-and-submit` | `docs/status/PROJECT-STATUS.md` | 2026-03-05 |
| `/profile` | Profile | Main | P1 | Done | claude | DANG-PRF-001 | `page-profile-upgrade` | `feature-data-binding-and-loading`, `feature-form-validation-and-submit` | `docs/status/PROJECT-STATUS.md` | 2026-03-05 |
| `/modes` | Modes | Main | P2 | QA | claude | DANG-MAT-001, DANG-B2B-001 | `page-modes-upgrade` | `feature-navigation-and-gesture` | `docs/status/PROJECT-STATUS.md` | 2026-03-05 |
| `/care` | Care | Main | P2 | QA | claude | DANG-B2B-001 | `page-care-upgrade` | `feature-data-binding-and-loading` | `docs/status/PROJECT-STATUS.md` | 2026-03-05 |
| `/family` | Family | Main | P2 | QA | claude | DANG-B2B-001 | `page-family-upgrade` | `feature-data-binding-and-loading` | `docs/status/PROJECT-STATUS.md` | 2026-03-05 |

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

