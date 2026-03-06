---
# File: Skill instructions for route-board parity validation and correction.
name: dang-route-doc-parity
description: Validate and enforce consistency between Next.js App Router page routes and docs/status/PAGE-UPGRADE-BOARD.md rows. Use when adding/removing routes, updating route ownership/status, or preparing QA/Done evidence that requires code-doc alignment.
---

# dang-route-doc-parity

## Inputs
- App routes from `frontend/src/app/**/page.tsx`.
- Route board: `docs/status/PAGE-UPGRADE-BOARD.md`.
- Daily log target: `docs/daily/MM-DD/page-<route>.md` or stabilization log.

## Procedure
1. Run route/doc parity validator:
   - `npm run validate:route-doc-parity`
2. If `MISSING_IN_BOARD` exists:
   - Add route rows to `PAGE-UPGRADE-BOARD.md` with parity IDs and owner.
3. If `STALE_IN_BOARD` exists:
   - Remove obsolete rows or restore missing route implementation intentionally.
4. Re-run validator until `ROUTE_DOC_PARITY=PASS`.
5. Sync related status docs:
   - `docs/status/PROJECT-STATUS.md`
   - `docs/status/11-FEATURE-PARITY-MATRIX.md`
6. Log evidence in daily docs with command output summary.

## Validation Checklist
- Route counts between app and board are equal.
- No mismatch entries in validator output.
- Board updates include route owner, status, and parity IDs.
- Daily log records command and result.

## Output Template
- Scope:
- Route parity result:
- Updated docs:
- Risks:
