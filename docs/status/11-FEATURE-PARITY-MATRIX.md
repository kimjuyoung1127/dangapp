# Feature Parity Matrix

## Status Definitions

- Not Started
- In Progress
- Blocked
- Done
- Deferred

## Matrix

| Parity ID | Domain | Target Routes | Change Type | Status | Test Scope | Risk | Notes |
|---|---|---|---|---|---|---|---|
| DANG-INFRA-001 | schema/rls/storage/mcp | supabase migration layer | rewrite | Done | sql/integration | High | schema expansion + policy baseline, 29 tables, 65 RLS policies, 4 storage buckets verified |
| DANG-DES-001 | design system | global + all main routes | adapt | QA | visual/a11y | Medium | toss-style token-driven UX, onboarding + home at QA |
| DANG-AUTH-001 | auth/consent | `/login`, `/register`, `/auth/callback` | adapt | In Progress | unit/integration | Medium | Google OAuth entry unified for login/register, required-consent gate + consent cookie wiring implemented, callback writes 4 `consent_logs` rows; Playwright unauth auth-route checks PASS, signed-in/manual OAuth QA evidence pending |
| DANG-ONB-001 | onboarding | `/onboarding` | rewrite | Verified | integration/e2e | High | guardian/dog field model expansion and time-slot split implemented, `/onboarding` done (2026-03-03) |
| DANG-MAT-001 | matching/filter | `/home`, `/modes` | rewrite | In Progress | integration/e2e | High | `match_guardians_v2` + `useMatch.ts` aligned, `/modes` B2B status dashboard added (care/family live counts + retry + summary helper), Playwright route harness added (`@unauth` PASS / `@signed` gated by storageState) |
| DANG-CHT-001 | realtime chat | `/chat`, `/chat/[id]` | adapt | QA | integration/e2e | High | chat_messages RLS recursion (`42P17`) fixed, legacy schedule cards backfilled with `scheduleId`, one-shot schedule response guard + optimistic click lock applied, local regression test suite (16 tests) added |
| DANG-WLK-001 | walk record/review | `/chat/[id]`, post-schedule flow | new | QA | integration/e2e | High | `/chat/[id]` + `/schedules` at QA, record + rating + visibility |
| DANG-DLG-001 | danglog collaboration | `/danglog`, `/danglog/[id]` | adapt | QA | integration/e2e | Medium | feed + detail route tracked, invite link + collaborators |
| DANG-PRF-001 | profile/settings | `/profile` | adapt | QA | unit/integration | Medium | guardian/dog edit + notification settings |
| DANG-B2B-001 | b2b partner model | `/modes`, `/care`, `/family` + ops surfaces | new | In Progress | integration/manual | Medium | `/care` reservations-first flow completed + `/family` ownership/schedule real-data binding completed (`dog_ownership`, `schedule_participants`, `schedules`), local regression tests added; signed-in integration evidence pending |

## Operating Rules

1. All implementation commits must map to at least one parity ID.
2. `Done` requires objective validation evidence.
3. Status transitions must be reflected in `PROJECT-STATUS.md` and route board.
