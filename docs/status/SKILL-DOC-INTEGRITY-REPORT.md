# Skill-Doc Integrity Report

**Generated**: 2026-03-03T17:04:XX KST  
**Run**: Dawn Sweep — STEP 2

---

## Summary

| Category | Count | Severity |
|----------|-------|----------|
| MISSING_SKILL (matrix → disk gap) | 0 | ✅ Clear |
| UNTRACKED_SKILL (disk, not in matrix/board) | 8 | ℹ️ Info |
| BOARD_DANGLING (board ref, no disk file) | 1 | ⚠️ Warning |
| BOARD_UNMATRIX (board ref, not in matrix) | 1 | ⚠️ Warning |
| BROKEN_PATH (skill refs missing file) | 5 | ⚠️ Warning |
| INCOMPLETE_SKILL (missing required sections) | 13 | ⚠️ Warning |

---

## MISSING_SKILL — ✅ None

All matrix-registered skills exist on disk.

---

## UNTRACKED_SKILL — Info (8)

Skills on disk not referenced in SKILL-DOC-MATRIX or PAGE-UPGRADE-BOARD:

- `dang-supabase-mcp`
- `dangapp-app-shell`
- `dangapp-cva-factory`
- `dangapp-form-step`
- `dangapp-motion-wrapper`
- `dangapp-skeleton-factory`
- `dangapp-supabase-hook`
- `dangapp-trust-visual`

> These are utility/pattern skills. Consider adding to SKILL-DOC-MATRIX as support skills.

---

## BOARD_DANGLING — Warning (1)

Board references a skill with no disk file:

- `page-schedules-upgrade` — referenced in PAGE-UPGRADE-BOARD.md, file does not exist

---

## BOARD_UNMATRIX — Warning (1)

- `page-schedules-upgrade` — in board but not in SKILL-DOC-MATRIX

---

## BROKEN_PATH — Warning (5)

Skill files reference frontend paths that do not exist on disk:

| Skill | Missing Path |
|-------|-------------|
| `page-care-upgrade` | `frontend/src/lib/hooks/useCare.ts` |
| `page-danglog-feed-upgrade` | `frontend/src/components/features/danglog/InviteCollaborator.tsx` |
| `page-family-upgrade` | `frontend/src/lib/hooks/useFamily.ts` |
| `page-onboarding-upgrade` | `frontend/src/components/features/onboarding/Step3DogDetails.tsx` |
| `page-profile-upgrade` | `frontend/src/components/features/profile/EditProfileForm.tsx` |

---

## INCOMPLETE_SKILL — Warning (13)

Skills missing required sections (Trigger / Input Context / Read First / Do / Validation / Output):

| Skill | Missing Sections |
|-------|-----------------|
| `dang-supabase-mcp` | Trigger, Input Context, Read First, Validation, Output |
| `dangapp-app-shell` | Trigger, Input Context, Read First, Do, Validation, Output |
| `dangapp-cva-factory` | Trigger, Input Context, Read First, Do, Validation, Output |
| `dangapp-form-step` | Trigger, Input Context, Read First, Validation, Output |
| `dangapp-motion-wrapper` | Trigger, Input Context, Read First, Do, Validation, Output |
| `dangapp-skeleton-factory` | Trigger, Input Context, Read First, Validation, Output |
| `dangapp-supabase-hook` | Trigger, Input Context, Read First, Do, Validation, Output |
| `dangapp-trust-visual` | Trigger, Input Context, Read First, Do, Validation, Output |
| `feature-data-binding-and-loading` | Input Context, Read First, Do |
| `feature-error-and-retry-state` | Input Context, Read First, Do |
| `feature-form-validation-and-submit` | Input Context, Read First, Do |
| `feature-navigation-and-gesture` | Input Context, Read First, Do |
| `feature-ui-empty-and-skeleton` | Input Context, Read First, Do |

> Utility skills (dangapp-*) use a different format; section schema may not apply.

---

## Disk Skill Inventory (24 total)

Page skills (11): page-login, page-register, page-onboarding, page-home, page-chat-list, page-chat-room, page-danglog-feed, page-profile, page-modes, page-care, page-family  
Feature skills (5): feature-data-binding-and-loading, feature-error-and-retry-state, feature-form-validation-and-submit, feature-navigation-and-gesture, feature-ui-empty-and-skeleton  
Utility skills (8): dangapp-app-shell, dangapp-cva-factory, dangapp-form-step, dangapp-motion-wrapper, dangapp-skeleton-factory, dangapp-supabase-hook, dangapp-trust-visual, dang-supabase-mcp

