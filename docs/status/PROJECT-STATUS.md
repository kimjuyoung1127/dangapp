# DangApp Project Status

Last Updated: 2026-03-05 (KST) manual update (security hardening + env bootstrap sync)
Owner Doc: `CLAUDE.md`

## Execution Phases

| Phase | Status | Notes |
|---|---|---|
| Wave 0: workflow alignment | Done | docs/status + route board + skill matrix bootstrap completed. |
| Wave 1: schema foundation | Done | 怨좊룄???꾨즺 (Phase 1~3) + 由щ럭 蹂닿컯 ?⑥튂 諛섏쁺 + ?먭꺽 Supabase ?ъ쟻???ㅻえ??寃利??꾨즺 (`match_guardians_v2`, `set_guardian_location`, Phase1 ?섏〈 而щ읆 蹂듦뎄). |
| Wave 2: onboarding rebuild | Done | /onboarding 援ы쁽 ?꾨즺 (RHF+Zod+Supabase hook+upload). Type Modeling & Mapper 怨좊룄???꾨즺. |
| Wave 3: home matching/filter | InProgress | `useMatch.ts` -> `match_guardians_v2` ?곕룞 ?꾨즺, ?먭꺽 ?⑥닔 誘몄꽕移??섏〈 ?꾨씫 ?댁뒋 ?댁냼(2026-03-04). `/modes` ?쇱슦??諛?E2E 寃利??붿뿬. |

| Wave 4: chat/schedule/walk | QA | /schedules QA, /chat QA, /chat/[id] QA. ???쇱슦???ㅻ뜲?댄꽣 諛붿씤???꾨즺. |
| Wave 5: danglog/profile/notice | QA | /danglog QA, /profile QA. ?ㅻ뜲?댄꽣 諛붿씤??+ ?묒뾽 ??+ ?몄쭛 ?쒗듃 ?꾨즺. |
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

Overall parity verification: 1 Verified / 10 active IDs = 10% (7 routes at QA ??58% implementation complete, verification pending)

## Active Parity IDs

| Parity ID | Domain | Status | Remaining |
|---|---|---|---|
| DANG-INFRA-001 | Schema/MCP/Storage/RLS | Done | ??|
| DANG-DES-001 | Toss-like design system | QA | route-level verification pending |
| DANG-AUTH-001 | auth + consent | Ready | implementation pending |
| DANG-ONB-001 | guardian/dog onboarding | QA | end-to-end verification + edge-case testing |
| DANG-MAT-001 | matching + filters | InProgress | /modes route + end-to-end verification pending |
| DANG-CHT-001 | realtime chat + schedule | QA | end-to-end verification pending |
| DANG-WLK-001 | walk records + review | QA | end-to-end verification pending |
| DANG-DLG-001 | collaborative danglog | QA | end-to-end verification pending |
| DANG-PRF-001 | profile/notification settings | QA | end-to-end verification pending |
| DANG-B2B-001 | partner-place model | InProgress | `/family` blocked by API 500; `/modes`,`/care` at QA |

## Blockers

1. ~~Core table RLS for existing schema is incomplete and must be hardened before production traffic.~~ **[RESOLVED ??DANG-INFRA-001 Done: 65 RLS policies verified]**
2. ~~Onboarding UX spec has many fields requiring storage + schema support; this is Wave 1 dependency.~~ **[RESOLVED ??Wave 1 Done: schema + storage policies applied]**
3. ~~MCP connection requires valid `SUPABASE_ACCESS_TOKEN` in runtime environment.~~ **[RESOLVED ??2026-03-04 Access token verified and used for schema audit]**
4. ~~`match_guardians_v2` 404/?고????ㅽ뙣 媛?μ꽦(?먭꺽 ?⑥닔/?섏〈 ?ㅽ궎留??꾨씫).~~ **[RESOLVED ??2026-03-04 ?먭꺽 ?ъ쟻??+ Phase1 ?섏〈 而щ읆 蹂듦뎄 + ?ㅻえ???몄텧 ?듦낵]**

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
