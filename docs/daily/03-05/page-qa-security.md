# 03-05 Security + Quality Gate + QA Sync

## Scope
- DANG-INFRA-001 follow-up hardening prep
- Frontend lint/type/build recovery
- Route QA board sync for `/home`, `/chat`, `/chat/[id]`, `/schedules`, `/danglog`, `/profile`

## Changes
- Added migration file:
  - `supabase/migrations/20260305110000_security_hardening_search_path_and_spatial_rls.sql`
- Frontend lint fixes:
  - `src/app/(auth)/login/page.tsx`
  - `src/components/features/match/MatchCard.tsx`
  - `src/components/features/onboarding/Step7ActivityTimes.tsx`
  - `src/lib/utils/mappers.ts`
- Status docs synced:
  - `docs/status/PROJECT-STATUS.md`
  - `docs/status/PAGE-UPGRADE-BOARD.md`
  - `docs/status/MISSING-AND-UNIMPLEMENTED.md`

## Validation
- `cd frontend && npx tsc --noEmit -p ./tsconfig.json` -> PASS
- `cd frontend && npm run lint` -> PASS
- `cd frontend && npm run build` -> PASS
- SQL smoke:
  - `match_guardians_v2` returned rows (`match_rows=3`)
  - table counts query for chat/schedule/danglog/profile domain succeeded

## Blocker
- Supabase remote apply blocked by MCP mode:
  - error: `Cannot apply migration in read-only mode.`
- Result: security advisor findings are unchanged until migration is applied from a writable context.

## Decisions
- Keep `public.leads` permissive policy unchanged for now (external project dependency).

## Encoding Guardrails
- Added .gitattributes to enforce LF text normalization.
- Added scripts/check-encoding.mjs (UTF-8 no BOM + LF validator).
- Wired encoding check into root/frontend lint and build scripts.
## Re-run (Writable MCP)
- Reconnected Supabase MCP with write access (current_user=postgres, transaction_read_only=off).
- Initial migration with spatial_ref_sys RLS failed: must be owner of table spatial_ref_sys (supabase_admin owner).
- Applied split migration successfully: security_hardening_function_search_path_only.
- Security Advisor after re-run:
  - resolved: function_search_path_mutable (5)
  - remaining: rls_disabled_in_public (public.spatial_ref_sys), extension_in_public(postgis), public.leads permissive policy (intentional), auth_leaked_password_protection.

## Decision Update
- Keep public.leads policy unchanged (external dependency) and track as accepted risk.
- Track spatial_ref_sys as owner-context blocked item; not changed in this cycle.

## App SRID Catalog
- Added migration: `supabase/migrations/20260305022335_create_app_srid_catalog.sql`
- Applied migration: `create_app_srid_catalog` (remote success).
- Created `public.app_srid_catalog` with RLS + policies and seeded `EPSG:4326`.
- Direction: app code should use `app_srid_catalog` if SRID metadata lookup is needed, not `public.spatial_ref_sys`.

## Local Env Bootstrap
- Created `frontend/.env.local` for new machine onboarding.
- Filled:
  - `NEXT_PUBLIC_SUPABASE_URL=https://fjpvtivpulreulfxmxfe.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<project anon key>`
  - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- Left optional values blank:
  - `KAKAO_CLIENT_ID`
  - `KAKAO_CLIENT_SECRET`
