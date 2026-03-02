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
| DANG-INFRA-001 | schema/rls/storage/mcp | supabase migration layer | rewrite | In Progress | sql/integration | High | schema expansion + policy baseline |
| DANG-DES-001 | design system | global + all main routes | adapt | Ready | visual/a11y | Medium | toss-style token-driven UX |
| DANG-AUTH-001 | auth/consent | `/login`, `/register` | adapt | Ready | unit/integration | Medium | consent logs + progressive gating |
| DANG-ONB-001 | onboarding | `/onboarding` | rewrite | In Progress | integration/e2e | High | guardian/dog field model expansion and time-slot split implemented |
| DANG-MAT-001 | matching/filter | `/home`, `/modes` | rewrite | Ready | integration/e2e | High | distance/time/mode filtering + request flow |
| DANG-CHT-001 | realtime chat | `/chat`, `/chat/[id]` | adapt | Ready | integration/e2e | High | schedule cards + safety banner |
| DANG-WLK-001 | walk record/review | `/chat/[id]`, post-schedule flow | new | Ready | integration/e2e | High | record + rating + visibility |
| DANG-DLG-001 | danglog collaboration | `/danglog` | adapt | Ready | integration/e2e | Medium | invite link + collaborators |
| DANG-PRF-001 | profile/settings | `/profile` | adapt | Ready | unit/integration | Medium | guardian/dog edit + notification settings |
| DANG-B2B-001 | b2b partner model | `/modes`, `/care`, `/family` + ops surfaces | new | Ready | integration/manual | Medium | partner-place and coupon hooks |

## Operating Rules

1. All implementation commits must map to at least one parity ID.
2. `Done` requires objective validation evidence.
3. Status transitions must be reflected in `PROJECT-STATUS.md` and route board.
