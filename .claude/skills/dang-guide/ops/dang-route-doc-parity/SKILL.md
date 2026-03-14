---
name: dang-route-doc-parity
description: Validate and enforce consistency between Next.js App Router page routes and `docs/status/PAGE-UPGRADE-BOARD.md` before status sync work.
---

# dang-route-doc-parity

## Trigger
- Adding or removing a page route.
- Updating route owner, status, or parity evidence.
- Preparing route work for QA, Done, or status sync.

## Inputs
- App routes from `frontend/src/app/**/page.tsx`
- Route board: `docs/status/PAGE-UPGRADE-BOARD.md`
- Daily log target for parity evidence

## Read First
1. `docs/status/PAGE-UPGRADE-BOARD.md`
2. `docs/status/PROJECT-STATUS.md`
3. `docs/status/11-FEATURE-PARITY-MATRIX.md`

## Procedure
1. Compare the actual App Router routes with board rows.
2. Add missing rows, remove stale rows, or restore intentionally omitted routes.
3. Sync related status docs when parity evidence or route state changed.
4. Record the verification result in daily or stabilization docs.

## Validation
- Route counts between app and board are aligned.
- No referenced route is stale or missing.
- Board rows include owner, status, and parity IDs.
- Daily evidence reflects the final parity result.

## Output
- Scope:
- Route parity result:
- Updated docs:
- Validation:
- Risks:
