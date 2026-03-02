# DangApp Project Status

Last Updated: 2026-03-02 (KST)
Owner Doc: `CLAUDE.md`

## Execution Phases

| Phase | Status | Notes |
|---|---|---|
| Wave 0: workflow alignment | Done | docs/status + route board + skill matrix bootstrap completed. Skill rebuild (tosstaillog 패턴) 완료: 11 page skills + 5 feature skills + MCP sections |
| Wave 1: schema foundation | In Progress | migration + RLS + storage buckets/policies authored |
| Wave 2: onboarding rebuild | Ready | gated by Wave 1 completion |
| Wave 3: home matching/filter | Ready | gated by Wave 1 completion |
| Wave 4: chat/schedule/walk | Ready | gated by Wave 3 completion |
| Wave 5: danglog/profile/notice | Ready | gated by Wave 4 completion |
| Wave 6: B2B partner flow | Ready | gated by Wave 5 completion |

## Active Parity IDs

| Parity ID | Domain | Status | Remaining |
|---|---|---|---|
| DANG-INFRA-001 | Schema/MCP/Storage/RLS | In Progress | end-to-end policy verification |
| DANG-DES-001 | Toss-like design system | Ready | route-level upgrades pending |
| DANG-AUTH-001 | auth + consent | Ready | implementation pending |
| DANG-ONB-001 | guardian/dog onboarding | In Progress | step persistence + bottom sheet UX + upload integration pending |
| DANG-MAT-001 | matching + filters | Ready | implementation pending |
| DANG-CHT-001 | realtime chat + schedule | Ready | implementation pending |
| DANG-WLK-001 | walk records + review | Ready | implementation pending |
| DANG-DLG-001 | collaborative danglog | Ready | implementation pending |
| DANG-PRF-001 | profile/notification settings | Ready | implementation pending |
| DANG-B2B-001 | partner-place model | Ready | implementation pending |

## Blockers

1. Core table RLS for existing schema is incomplete and must be hardened before production traffic.
2. Onboarding UX spec has many fields requiring storage + schema support; this is Wave 1 dependency.
3. MCP connection requires valid `SUPABASE_ACCESS_TOKEN` in runtime environment.
