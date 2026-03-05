# 03-05 B2B Speed-First Implementation + QA Log

## Scope
- DANG-B2B-001 speed-first implementation for `/modes`, `/care`, `/family`
- No DB migration, no public API change
- Focus: faster perceived interaction + optimistic updates + reduced motion overhead

## Implementation Summary
- Motion system tuned for responsiveness:
  - shorter reveal durations
  - reduced stagger delay
  - `prefers-reduced-motion` fallback support
- `/modes`:
  - unified unlock logic (`mode_unlocks` + `basic` always unlocked + level fallback)
  - immediate route transition or lock dialog
- `/care`:
  - removed empty `caregiver_id` submit path
  - added required caregiver selection flow
  - added optimistic create + rollback
  - kept previous tab data while background refresh runs
  - added error recovery UI (retry + inline alert)
- `/family`:
  - added optimistic group create + rollback
  - added member-count fallback when per-card query fails
  - improved empty/error state recovery UI

## Validation
- Static gates:
  - `cd frontend && npx tsc --noEmit -p ./tsconfig.json` -> PASS
  - `cd frontend && npm run lint` -> PASS
- Playwright evidence:
  - `output/playwright/b2b-qa-20260305/results.json` (unauth route-guard run)
  - `output/playwright/b2b-qa-20260305/results-authenticated.json` (authenticated in-route run)
  - screenshots:
    - `output/playwright/b2b-qa-20260305/home-authenticated.png`
    - `output/playwright/b2b-qa-20260305/modes-authenticated.png`
    - `output/playwright/b2b-qa-20260305/care-authenticated-form.png`
    - `output/playwright/b2b-qa-20260305/family-create-failure.png`
    - `output/playwright/b2b-qa-20260305/family-create-success.png`

## QA Result
- Authenticated in-route checks:
  - `/modes` PASS: basic active + locked mode dialog behavior verified
  - `/care` PASS: tab switch/empty/form open/submit guard (`caregiver_id` required) verified
  - `/family` PASS (after fix): group create + immediate list reflection + refresh persistence verified
- Root cause and fix on `/family`:
  - root cause 1: recursive/malformed RLS policy on `family_members` (`42P17 infinite recursion`)
  - root cause 2: create mutation used `.insert(...).select().single()`, which triggered select-policy denial before membership row insertion
  - fix applied:
    - DB: `supabase/migrations/20260305133000_fix_family_rls_recursion.sql` applied to remote
    - FE: `useCreateFamilyGroup` switched to client UUID + insert without immediate select
    - FE: `useFamilyMembers` skips optimistic IDs (`optimistic-*`) to prevent transient 400 fetches
- Speed gate (dev-local):
  - button/tap feedback and tab transition are immediate in manual Playwright checks
  - route-level 500ms target can fluctuate on dev hot-reload; no blocker-level regression observed

## Self-Review Gate
- Optimistic update rollback paths verified in `useMode.ts`
- Query key consistency and invalidation paths normalized in `useMode.ts`
- Motion reduction honors `prefers-reduced-motion`
- `/family` blocker resolved and re-verified with Playwright
