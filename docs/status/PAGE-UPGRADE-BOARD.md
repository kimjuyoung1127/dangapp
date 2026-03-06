# Page Upgrade Board

| route | label | group | priority | status | owner | parity_ids | page_skill | support_skills | must_read_docs | last_updated |
|---|---|---|---|---|---|---|---|---|---|---|
| `/login` | Login | Auth | P1 | QA | codex | DANG-AUTH-001 | `page-login-upgrade` | `feature-form-validation-and-submit`, `feature-error-and-retry-state` | `docs/status/PROJECT-STATUS.md` | 2026-03-06 |
| `/register` | Register | Auth | P1 | QA | codex | DANG-AUTH-001 | `page-register-upgrade` | `feature-form-validation-and-submit` | `docs/status/PROJECT-STATUS.md` | 2026-03-06 |
| `/onboarding` | Onboarding | Onboarding | P0 | Done | claude | DANG-ONB-001, DANG-DES-001 | `page-onboarding-upgrade` | `feature-form-validation-and-submit`, `feature-navigation-and-gesture` | `docs/status/PROJECT-STATUS.md`, `docs/status/11-FEATURE-PARITY-MATRIX.md` | 2026-03-04 |
| `/home` | Home | Main | P0 | QA | claude | DANG-MAT-001, DANG-DES-001 | `page-home-upgrade` | `feature-data-binding-and-loading`, `feature-ui-empty-and-skeleton` | `docs/status/PROJECT-STATUS.md`, `docs/status/MISSING-AND-UNIMPLEMENTED.md` | 2026-03-05 |
| `/chat` | Chat List | Main | P1 | QA | codex | DANG-CHT-001 | `page-chat-list-upgrade` | `feature-data-binding-and-loading`, `feature-ui-empty-and-skeleton` | `docs/status/PROJECT-STATUS.md` | 2026-03-06 |
| `/chat/[id]` | Chat Room | Main | P0 | QA | codex | DANG-CHT-001, DANG-WLK-001 | `page-chat-room-upgrade` | `feature-navigation-and-gesture`, `feature-error-and-retry-state` | `docs/status/PROJECT-STATUS.md` | 2026-03-06 |
| `/schedules` | Schedules | Main | P1 | QA | claude | DANG-WLK-001 | `page-schedules-upgrade` | `feature-data-binding-and-loading`, `feature-form-validation-and-submit` | `docs/status/PROJECT-STATUS.md` | 2026-03-03 |
| `/danglog` | DangLog Feed | Main | P1 | QA | claude | DANG-DLG-001 | `page-danglog-feed-upgrade` | `feature-data-binding-and-loading`, `feature-form-validation-and-submit` | `docs/status/PROJECT-STATUS.md` | 2026-03-03 |
| `/danglog/[id]` | DangLog Detail | Main | P1 | QA | codex | DANG-DLG-001 | `page-danglog-feed-upgrade` | `feature-data-binding-and-loading`, `feature-form-validation-and-submit` | `docs/status/PROJECT-STATUS.md` | 2026-03-06 |
| `/profile` | Profile | Main | P1 | QA | claude | DANG-PRF-001 | `page-profile-upgrade` | `feature-data-binding-and-loading`, `feature-form-validation-and-submit` | `docs/status/PROJECT-STATUS.md` | 2026-03-03 |
| `/modes` | Modes | Main | P2 | QA | codex | DANG-MAT-001, DANG-B2B-001 | `page-modes-upgrade` | `feature-navigation-and-gesture` | `docs/status/PROJECT-STATUS.md` | 2026-03-06 |
| `/care` | Care | Main | P2 | InProgress | codex | DANG-B2B-001 | `page-care-upgrade` | `feature-data-binding-and-loading` | `docs/status/PROJECT-STATUS.md` | 2026-03-06 |
| `/family` | Family | Main | P2 | InProgress | codex | DANG-B2B-001 | `page-family-upgrade` | `feature-data-binding-and-loading` | `docs/status/PROJECT-STATUS.md` | 2026-03-06 |

## Status Flow

`Ready -> InProgress -> QA -> Done` (`Hold` allowed for blockers).

## Dual-Agent Rules
<!-- Owner: `claude` | `codex` | `unassigned`. See docs/ref/DUAL-AGENT-HANDOFF.md for claim/release protocol. -->
