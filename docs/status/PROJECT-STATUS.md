# DangApp Project Status

Last Updated: 2026-03-06 (KST)
Owner Doc: `CLAUDE.md`

## Execution Phases

| Phase | Status | Notes |
|---|---|---|
| Wave 0: workflow alignment | Done | Status docs + route board + skill matrix baseline established. |
| Wave 1: schema foundation | Done | Core schema, RLS, storage, and MCP validation completed. |
| Wave 2: onboarding rebuild | Done | `/onboarding` shipped with RHF+Zod+Supabase hooks and upload flow. |
| Wave 3: matching/filter | In Progress | `/home` QA, `/modes` real-data/error handling updated, integrated E2E pending. |
| Wave 4: chat/schedule/walk | QA | `/chat`, `/chat/[id]`, `/schedules` at QA pending full regression pass. |
| Wave 5: danglog/profile/notice | QA | `/danglog`, `/danglog/[id]`, `/profile` tracked at QA pending full E2E pass. |
| Wave 6: B2B partner flow | In Progress | `/care`, `/family` moved to implementation with partner place/reservation/family bindings. |

## Wave Progress

| Wave | Parity IDs | Status | Progress |
|---|---|---|---|
| 0 | workflow | Done | 100% |
| 1 | DANG-INFRA-001 | Done | 100% |
| 2 | DANG-ONB-001 | Done | 100% |
| 3 | DANG-MAT-001, DANG-CHT-001 | QA | 80% |
| 4 | DANG-WLK-001, DANG-DLG-001, DANG-PRF-001 | QA | 75% |
| 5 | DANG-AUTH-001, DANG-B2B-001 | In Progress | 40% |

Overall parity verification: 2/10 verified or done. Main remaining work is integrated E2E stabilization and B2B completion.

## Active Parity IDs

| Parity ID | Domain | Status | Remaining |
|---|---|---|---|
| DANG-INFRA-001 | Schema/MCP/Storage/RLS | Done | None |
| DANG-DES-001 | Design system | QA | route-level visual/accessibility verification |
| DANG-AUTH-001 | auth + consent | In Progress | consent log completeness verified (`COMPLETE_4_TYPES=1`), signed-in integrated E2E closure remaining |
| DANG-ONB-001 | guardian/dog onboarding | Verified | edge-case regression sweep |
| DANG-MAT-001 | matching + filters | In Progress | integrated E2E + release evidence |
| DANG-CHT-001 | realtime chat + schedule | QA | chat RLS recursion hotfix + legacy scheduleId backfill completed; final signed-in E2E evidence |
| DANG-WLK-001 | walk records + review | QA | end-to-end verification |
| DANG-DLG-001 | collaborative danglog | QA | feed/detail route regression verification |
| DANG-PRF-001 | profile/notification settings | QA | end-to-end verification |
| DANG-B2B-001 | partner-place model | In Progress | care/family implementation hardening + QA |

## Blockers

1. None critical. Current focus is stabilization and verification.
2. Integrated E2E evidence needs to be captured for QA-to-Done transitions.
3. Route/doc parity sync must stay aligned as status changes.
