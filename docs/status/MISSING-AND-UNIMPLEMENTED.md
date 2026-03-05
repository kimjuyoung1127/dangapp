# Missing and Unimplemented

Last Updated: 2026-03-05 (security hardening + quality gate sync)

## High Priority Gaps

1. ~~Real onboarding persistence is not implemented end-to-end.~~ **[RESOLVED ??DANG-ONB-001 Verified, /onboarding Done 2026-03-03]** [tracked: DANG-ONB-001]
2. Matching home and chat pages still contain placeholder/mock behavior. [tracked: DANG-MAT-001, DANG-CHT-001]
3. Walk record and walk review tables/flows are absent in schema. [RESOLVED ??DANG-INFRA-001: schema + 4 storage buckets verified]
4. Collaborative danglog invite/participant model is absent in schema. [RESOLVED ??DANG-INFRA-001: schema + RLS verified]
5. Notification preference controls are missing. [tracked: DANG-PRF-001]
6. ~~Existing core table RLS coverage is incomplete.~~ [RESOLVED ??DANG-INFRA-001 Done: 65 RLS policies verified across 29 tables]

## V2 Candidates

1. Advanced trust scoring recalculation jobs.
2. In-app partner place reservation flow with payment.
3. Growth automations and notification templates.

## Execution Sync 2026-03-05

- Supabase writable MCP reconnection verified (postgres, read_write).
- Applied security_hardening_function_search_path_only; function_search_path_mutable warnings cleared.
- Added app-owned spatial metadata table public.app_srid_catalog (RLS enabled, EPSG:4326 seeded).
- public.spatial_ref_sys RLS warning remains because table owner is supabase_admin (owner-context change required).
- public.leads permissive RLS warning intentionally retained (external project dependency).
- Route QA status for /home, /chat, /chat/[id], /schedules, /danglog, /profile remains Done.

## Auth QA Sync 2026-03-05 (Playwright)

- Verified without code changes:
  - protected-route redirect (`/home` -> `/login`)
  - `/login` render + Google button visibility
  - Google OAuth authorize redirect
  - `/auth/callback` error routing without code
  - `/register` render
- Deferred gap:
  - Kakao auth end-to-end flow (intentionally excluded in this cycle).

## B2B QA Sync 2026-03-05 (Speed-First)

- Implemented:
  - `/modes`, `/care`, `/family` responsiveness hardening
  - optimistic mutation + rollback for care/family create flows
  - caregiver selection guard (no empty `caregiver_id` submission)
- Remaining gap:
  - route-level p95 speed needs prod-like measurement (dev hot-reload noise remains)
  - Kakao auth is still deferred by plan scope.

## B2B Family Follow-up 2026-03-05

- `/family` blocker resolved in current cycle:
  - DB policy recursion fixed via migration `20260305133000_fix_family_rls_recursion.sql`
  - FE create mutation updated to avoid immediate select-policy conflict
  - optimistic member-count transient error removed
- Current route status:
  - `/modes`, `/care`, `/family` are all at `QA`.

## Chat/DangLog Debug Data Follow-up 2026-03-05

- Completed:
  - Chat/DangLog debug seed scripts and cleanup/check workflow are in place.
  - Seed data injected successfully (medium + fanout runs).
  - DangLog seeded data is visible in runtime.
- Remaining gap:
  - `/chat` can still show empty state in some sessions even with seeded participant rows.
  - Potential session user / guardian mapping mismatch needs runtime confirmation.
  - Temporary safeguard added: explicit chat fetch-error UI (`frontend/src/app/(main)/chat/page.tsx`).
