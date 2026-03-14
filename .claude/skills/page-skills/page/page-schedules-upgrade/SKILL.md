---
name: page-schedules-upgrade
description: Upgrade `/schedules` route UI, data flow, and schedule follow-up actions for parity work.
---

# page-schedules-upgrade

## Trigger
- Improve or finish `/schedules`
- Resolve parity work for `DANG-WLK-001`
- Stabilize the route before QA or Done

## Input Context
- Route: `/schedules`
- Page file: `frontend/src/app/(main)/schedules/page.tsx`
- Parity: `DANG-WLK-001`
- Priority: `P1`

## Read First
1. `docs/status/PAGE-UPGRADE-BOARD.md`
2. `docs/status/SKILL-DOC-MATRIX.md`
3. `docs/status/PROJECT-STATUS.md`
4. `frontend/src/app/(main)/schedules/page.tsx`

## Related Files
- `frontend/src/app/(main)/schedules/page.tsx`
- `frontend/src/lib/hooks/useSchedule.ts`
- `frontend/src/lib/hooks/useReview.ts`
- `frontend/src/lib/hooks/useWalkRecord.ts`
- `frontend/src/components/features/review/ReviewForm.tsx`
- `frontend/src/components/features/walk/WalkRecordForm.tsx`

## Recommended Feature Skills
- `feature-data-binding-and-loading`
- `feature-form-validation-and-submit`
- `feature-error-and-retry-state`

## Procedure
1. Confirm the route's current board status and schedule-related parity expectations.
2. Keep edits focused on the schedules page, schedule hooks, and directly related review or walk-record follow-up flows.
3. Make loading, empty, cancelled, completed, and upcoming states explicit.
4. Preserve the chat-to-schedule contract when changing proposal, acceptance, or completion behavior.
5. Update docs or daily evidence when route behavior or parity status changes.

## Acceptance Focus
- schedule list loads from real data
- proposal and acceptance state remains consistent
- completed schedules can launch review and walk-record follow-up
- empty state coverage is intentional

## Validation
- `cd frontend && npx tsc --noEmit`
- Run the narrowest relevant test or lint path available.
- Verify route behavior manually if no automated check exists.
- Update route docs if status or evidence changed.

## Output
- Scope: `DANG-WLK-001`
- Files:
- Validation:
- Daily Sync:
- Risks:
- Self-Review:
- Next Recommendations:
