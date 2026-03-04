# DangApp Project Status

Last Updated: 2026-03-04 (KST) — manual update (remote Supabase apply + smoke verification)
Owner Doc: `CLAUDE.md`

## Execution Phases

| Phase | Status | Notes |
|---|---|---|
| Wave 0: workflow alignment | Done | docs/status + route board + skill matrix bootstrap completed. |
| Wave 1: schema foundation | Done | 고도화 완료 (Phase 1~3) + 리뷰 보강 패치 반영 + 원격 Supabase 재적용/스모크 검증 완료 (`match_guardians_v2`, `set_guardian_location`, Phase1 의존 컬럼 복구). |
| Wave 2: onboarding rebuild | Done | /onboarding 구현 완료 (RHF+Zod+Supabase hook+upload). Type Modeling & Mapper 고도화 완료. |
| Wave 3: home matching/filter | InProgress | `useMatch.ts` -> `match_guardians_v2` 연동 완료, 원격 함수 미설치/의존 누락 이슈 해소(2026-03-04). `/modes` 라우트 및 E2E 검증 잔여. |

| Wave 4: chat/schedule/walk | QA | /schedules QA, /chat QA, /chat/[id] QA. 전 라우트 실데이터 바인딩 완료. |
| Wave 5: danglog/profile/notice | QA | /danglog QA, /profile QA. 실데이터 바인딩 + 협업 훅 + 편집 시트 완료. |
| Wave 6: B2B partner flow | Ready | gated by Wave 5 completion |

## Wave Progress

| Wave | Parity IDs | Status | Progress |
|------|-----------|--------|----------|
| 0 | workflow | Done | 100% |
| 1 | DANG-INFRA-001 | Done | 100% |
| 2 | DANG-ONB-001 | Done | 100% |
| 3 | DANG-MAT-001, DANG-CHT-001 | QA | 75% |
| 4 | DANG-WLK-001, DANG-DLG-001, DANG-PRF-001 | QA | 75% |
| 5 | DANG-B2B-001 | Ready | 0% |

Overall parity verification: 1 Verified / 10 active IDs = 10% (7 routes at QA — 58% implementation complete, verification pending)

## Active Parity IDs

| Parity ID | Domain | Status | Remaining |
|---|---|---|---|
| DANG-INFRA-001 | Schema/MCP/Storage/RLS | Done | — |
| DANG-DES-001 | Toss-like design system | QA | route-level verification pending |
| DANG-AUTH-001 | auth + consent | Ready | implementation pending |
| DANG-ONB-001 | guardian/dog onboarding | QA | end-to-end verification + edge-case testing |
| DANG-MAT-001 | matching + filters | InProgress | /modes route + end-to-end verification pending |
| DANG-CHT-001 | realtime chat + schedule | QA | end-to-end verification pending |
| DANG-WLK-001 | walk records + review | QA | end-to-end verification pending |
| DANG-DLG-001 | collaborative danglog | QA | end-to-end verification pending |
| DANG-PRF-001 | profile/notification settings | QA | end-to-end verification pending |
| DANG-B2B-001 | partner-place model | Ready | implementation pending |

## Blockers

1. ~~Core table RLS for existing schema is incomplete and must be hardened before production traffic.~~ **[RESOLVED — DANG-INFRA-001 Done: 65 RLS policies verified]**
2. ~~Onboarding UX spec has many fields requiring storage + schema support; this is Wave 1 dependency.~~ **[RESOLVED — Wave 1 Done: schema + storage policies applied]**
3. ~~MCP connection requires valid `SUPABASE_ACCESS_TOKEN` in runtime environment.~~ **[RESOLVED — 2026-03-04 Access token verified and used for schema audit]**
4. ~~`match_guardians_v2` 404/런타임 실패 가능성(원격 함수/의존 스키마 누락).~~ **[RESOLVED — 2026-03-04 원격 재적용 + Phase1 의존 컬럼 복구 + 스모크 호출 통과]**
