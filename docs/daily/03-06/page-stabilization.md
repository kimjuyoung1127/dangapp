<!-- File: Consolidated 03-06 execution log for stabilization, B2B, and auth tracks. -->
# 03-06 Stabilization + B2B + Auth Log

## Parity Scope
- DANG-MAT-001
- DANG-B2B-001
- DANG-AUTH-001
- DANG-DLG-001 (board tracking sync)

## Implemented
1. `/modes`
- Reworked page with explicit loading/error/empty handling.
- Added live summary cards from Supabase (`partner_places`, `reservations`, `family_members`, `schedule_participants`).

2. `/care`
- Added partner place discovery and category filtering.
- Added reservation creation flow and reservation status/cancel actions.
- Kept legacy care request list as secondary tab.

3. `/family`
- Added live summary from `dog_ownership` and `schedule_participants`.
- Kept family group creation/list flow and member counts.

4. `/login`, `/register`, `/auth/callback`
- Unified auth entry with shared Google OAuth gate.
- Added required consent gating (terms/privacy) and optional toggles (location/marketing).
- Stored consent payload via cookie and inserted 4 consent rows in callback (`consent_logs`).

5. Code-doc and status sync
- Added `/danglog/[id]` route to board + skill matrix.
- Updated parity/project status docs for auth/B2B progress.
- Added integrated E2E checklist for QA stabilization.
- Normalized malformed daily folder (`docs/daily/3-02` -> `docs/daily/03-02`).

6. Route-doc parity hardening
- Added executable validator for App Router route vs board route sync.
- Added reusable ops skill `dang-route-doc-parity` and registered it in skill matrix.
- Added root rule to run parity validation before route status doc updates.

7. QA route smoke baseline
- Added `scripts/smoke-qa-routes.mjs` to validate auth/public route behavior in one command.
- Added `npm run smoke:qa-routes` root script for repeatable pre-release smoke checks.
- Validated protected route redirect behavior and callback guard path.

8. Google OAuth start reliability fix
- Updated auth gate redirect target to use `NEXT_PUBLIC_SITE_URL` first, then `window.location.origin`.
- Prevented ambiguous click flow by disabling Google button until required consents are checked.
- Added inline guidance text for required consent checks.
- Updated Supabase Auth `uri_allow_list` to include both `localhost` and `127.0.0.1` callback URLs for local runs.

9. Chat empty-state resilience fix
- Reworked `useChatRooms` to avoid hard-fail empty list when `chat_participants`/`chat_rooms` reads fail or return empty.
- Added fallback path: `accepted matches` -> `create_chat_room_with_participants` RPC to ensure recoverable room list.
- Added defensive fallback room rows and partner resolution to keep chat list renderable during partial query failures.

10. Next server chunk resolution incident
- Observed runtime server error on `/chat/[id]`: missing `./vendor-chunks/@supabase.js` in `.next` cache.
- Cleared `frontend/.next` and re-ran full production build to regenerate server chunks.
- Verified post-fix route smoke gate passes and no missing chunk on generated `/chat/[id]` server bundle.

11. Chat schedule proposal persistence and response wiring
- Updated `/chat/[id]` schedule proposal flow to insert real `schedules` rows (not message-only metadata).
- Added schedule response mutation (`accepted`/`rejected`) and connected chat card action buttons.
- Synced cache invalidation for both schedule list and room messages to reflect status changes without manual refresh.

12. Chat RLS recursion incident fix (`42P17`)
- Reproduced `GET /rest/v1/chat_messages` failing with `500` and error: `infinite recursion detected in policy for relation "chat_participants"`.
- Added migration `20260306194000_fix_chat_rls_recursion.sql` with `SECURITY DEFINER` helper `is_room_participant(uuid)` and replaced `chat_rooms/chat_participants/chat_messages` select policies to use the helper.
- Applied migration to remote project and verified `chat_messages` endpoint returned `200` for the same room query.

13. Legacy schedule-card actionability + duplicate-response guard
- Added migration `20260306195500_backfill_schedule_message_ids.sql` to backfill `metadata.scheduleId` for legacy `chat_messages(type='schedule')` by matching/creating schedules.
- Confirmed backfill completion (`missing_count: 12 -> 0`) and target message `c9cb4878-...` now has `scheduleId`.
- Hardened response mutation to be one-shot (`proposal_status='proposed'` precondition) and changed update fetch flow to avoid `406` on already-processed schedules.

## Validation
- `npx tsc --noEmit` (frontend): pass.
- `npx eslint` on changed frontend files: pass.
- `npx next lint` (frontend): pass.
- `npm run build` (frontend): pass.
- `SUPABASE_ACCESS_TOKEN=<PAT> npm run validate:consent-logs`: pass (`LAST30_TOTAL_ROWS=4`, `COMPLETE_4_TYPES=1`, `INCOMPLETE_EVENTS_LT4=0`).
- `npm run validate:route-doc-parity`: pass (`APP_ROUTE_COUNT=13`, `BOARD_ROUTE_COUNT=13`).
- `npm run smoke:qa-routes`: pass (public routes 200, protected routes -> `/login`, callback -> `missing-auth-code`).
- `npm run lint --prefix frontend`: pass.
- `npm run build --prefix frontend`: pass.
- `npm run lint --prefix frontend` (after chat hook fallback update): pass.
- `npm run build --prefix frontend` (after chat hook fallback update): pass.
- Manual QA seed (service-role): updated one existing match to `accepted` and inserted 2 schedules (`confirmed`, `completed`) for logged-in guardian flow verification.
- `chat_messages` room query (previously failing with `42P17`): `200` verified after RLS policy migration.
- Legacy schedule metadata backfill verification: `missing scheduleId = 0`.
- `npm run lint --prefix frontend` (after duplicate-response/406 guard update): pass.
- `npm run build --prefix frontend` (after duplicate-response/406 guard update): pass.

## Known Follow-ups
1. Capture staging evidence for integrated E2E checklist scenarios.
2. Complete B2B route QA (`/care`, `/family`) and promote to QA/Done states.
3. Capture signed-in route regression evidence (`/home` -> `/chat` -> `/schedules`) using seeded `accepted` match and schedules.
4. If chat still shows empty after hard refresh, inspect client session propagation (`useCurrentGuardian` + RLS visibility) as next fix target.
