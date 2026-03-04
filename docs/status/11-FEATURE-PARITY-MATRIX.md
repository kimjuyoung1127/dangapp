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
| DANG-INFRA-001 | schema/rls/storage/mcp | supabase migration layer | rewrite | Done | sql/integration | High | schema expansion + policy baseline — 29 tables, 65 RLS policies, 4 storage buckets verified |
| DANG-DES-001 | design system | global + all main routes | adapt | QA | visual/a11y | Medium | toss-style token-driven UX — /onboarding + /home at QA |
| DANG-AUTH-001 | auth/consent | `/login`, `/register` | adapt | Ready | unit/integration | Medium | consent logs + progressive gating |
| DANG-ONB-001 | onboarding | `/onboarding` | rewrite | Verified | integration/e2e | High | guardian/dog field model expansion and time-slot split implemented — /onboarding Done (2026-03-03) |
| DANG-MAT-001 | matching/filter | `/home`, `/modes` | rewrite | In Progress | integration/e2e | High | `match_guardians_v2` + `useMatch.ts` 연동 완료, /home QA. /modes 구현 및 E2E 검증 pending |
| DANG-CHT-001 | realtime chat | `/chat`, `/chat/[id]` | adapt | QA | integration/e2e | High | /chat + /chat/[id] at QA — schedule cards + safety banner |
| DANG-WLK-001 | walk record/review | `/chat/[id]`, post-schedule flow | new | QA | integration/e2e | High | /chat/[id] + /schedules at QA — record + rating + visibility |
| DANG-DLG-001 | danglog collaboration | `/danglog` | adapt | QA | integration/e2e | Medium | /danglog at QA — invite link + collaborators |
| DANG-PRF-001 | profile/settings | `/profile` | adapt | QA | unit/integration | Medium | /profile at QA — guardian/dog edit + notification settings |
| DANG-B2B-001 | b2b partner model | `/modes`, `/care`, `/family` + ops surfaces | new | Ready | integration/manual | Medium | partner-place and coupon hooks |

## Operating Rules

1. All implementation commits must map to at least one parity ID.
2. `Done` requires objective validation evidence.
3. Status transitions must be reflected in `PROJECT-STATUS.md` and route board.
