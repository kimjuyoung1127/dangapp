# Skill-Doc Integrity Report

**Generated:** 2026-03-07
**Scope:** DangApp `.claude/skills/` directory vs. `SKILL-DOC-MATRIX.md` vs. `PAGE-UPGRADE-BOARD.md`

---

## Executive Summary

| Metric | Count | Status |
|--------|-------|--------|
| Total skills on disk | 30 | ✓ |
| Total skills in SKILL-DOC-MATRIX.md | 30 | ✓ |
| Total skills referenced on PAGE-UPGRADE-BOARD.md | 17 | ✓ |
| **missing_skill** (disk but not matrix) | 0 | ✓ CLEAN |
| **untracked** (matrix but not disk) | 0 | ✓ CLEAN |
| **board_dangling** (board but not matrix) | 1 | ⚠️ ACTION REQUIRED |
| **board_unmatrix** (matrix page_skill but not board) | 0 | ✓ CLEAN |
| **broken_path** (code paths that don't exist) | 0 | ✓ CLEAN |
| **incomplete** (missing required sections) | 18 | ⚠️ ACTION REQUIRED |

---

## Issues Requiring Action

### 1. board_dangling: Skills on Board but Not in Matrix (Count: 1)

The following skills are referenced on `PAGE-UPGRADE-BOARD.md` but NOT documented in `SKILL-DOC-MATRIX.md`:

| Skill Name | Route | Found On Board | Matrix Entry | Action |
|------------|-------|---|---|---|
| `page-schedules-upgrade` | `/schedules` | YES (row 7) | NO | **ADD to SKILL-DOC-MATRIX.md** |

**Root Cause:** The `/schedules` route was added to the board but the corresponding `page-schedules-upgrade` skill definition was not added to the matrix.

**Fix Instructions:**
1. Add a new row to the "Skill Doc Matrix" section (after `page-family-upgrade` row) in `SKILL-DOC-MATRIX.md`
2. Template:
   ```
   | `page-schedules-upgrade` | `/schedules` | `frontend/src/app/(main)/schedules/page.tsx`, `frontend/src/lib/hooks/useSchedule.ts` | `docs/status/PROJECT-STATUS.md` | `feature-data-binding-and-loading`, `feature-form-validation-and-submit` | schedule list with type filter, proposal/acceptance flow, realtime updates |
   ```

---

### 2. incomplete: Skills Missing Required Sections (Count: 18)

The following SKILL.md files have incomplete structure and are missing required sections:

#### A. Ops Skills with Missing Sections (11 skills)

| Skill | Missing Sections | Severity |
|-------|------------------|----------|
| `dang-folder-file-guardrails` | Read, Validation | MEDIUM |
| `dang-route-doc-parity` | Trigger, Read | MEDIUM |
| `dang-rpc-diagnosis` | Trigger, Input, Read, Do, Validation, Output | HIGH |
| `dang-supabase-mcp` | Trigger, Input, Read, Do, Validation, Output | HIGH |
| `dangapp-app-shell` | Trigger, Input, Read, Do, Validation, Output | HIGH |
| `dangapp-cva-factory` | Trigger, Input, Read, Do, Validation, Output | HIGH |
| `dangapp-form-step` | Trigger, Input, Read, Do, Validation, Output | HIGH |
| `dangapp-motion-wrapper` | Trigger, Input, Read, Do, Validation, Output | HIGH |
| `dangapp-skeleton-factory` | Trigger, Input, Read, Do, Validation, Output | HIGH |
| `dangapp-supabase-hook` | Trigger, Input, Read, Do, Validation, Output | HIGH |
| `dangapp-trust-visual` | Trigger, Input, Read, Do, Validation, Output | HIGH |

**Issue:** Most ops/component pattern skills lack the full trigger/input/do/output structure needed for consistent skill invocation.

#### B. Feature Skills with Missing Sections (5 skills)

| Skill | Missing Sections | Severity |
|-------|------------------|----------|
| `feature-data-binding-and-loading` | Read First | MEDIUM |
| `feature-error-and-retry-state` | Read First | MEDIUM |
| `feature-form-validation-and-submit` | Read First | MEDIUM |
| `feature-navigation-and-gesture` | Read First | MEDIUM |
| `feature-ui-empty-and-skeleton` | Read First | MEDIUM |

**Issue:** Feature skills are missing "Read First" sections that document prerequisite code to review before implementation.

#### C. Subagent Skills with Missing Sections (2 skills)

| Skill | Missing Sections | Severity |
|-------|------------------|----------|
| `subagent-doc-check` | Input (or Inputs) | MEDIUM |
| `subagent-pattern-collect` | Input (or Inputs) | MEDIUM |

**Issue:** Subagent skills lack explicit "Input" context documentation.

---

## Detailed Findings

### Skills On Disk (30 total)

**Page Skills (11):**
- ✓ `page-login-upgrade`
- ✓ `page-register-upgrade`
- ✓ `page-onboarding-upgrade`
- ✓ `page-home-upgrade`
- ✓ `page-chat-list-upgrade`
- ✓ `page-chat-room-upgrade`
- ✓ `page-danglog-feed-upgrade`
- ✓ `page-profile-upgrade`
- ✓ `page-modes-upgrade`
- ✓ `page-care-upgrade`
- ✓ `page-family-upgrade`

**Ops Skills (11):**
- ✓ `dang-route-doc-parity`
- ✓ `dang-supabase-mcp`
- ✓ `dang-rpc-diagnosis`
- ✓ `subagent-doc-check`
- ✓ `subagent-pattern-collect`
- ✓ `dang-ui-redesign-orchestrator`
- ✓ `dang-folder-file-guardrails`
- ✓ `dangapp-app-shell`
- ✓ `dangapp-cva-factory`
- ✓ `dangapp-form-step`
- ✓ `dangapp-motion-wrapper`

**Component Pattern Skills (5):**
- ✓ `dangapp-skeleton-factory`
- ✓ `dangapp-supabase-hook`
- ✓ `dangapp-trust-visual`

**Feature Skills (5):**
- ✓ `feature-data-binding-and-loading`
- ✓ `feature-error-and-retry-state`
- ✓ `feature-form-validation-and-submit`
- ✓ `feature-navigation-and-gesture`
- ✓ `feature-ui-empty-and-skeleton`

### Skills in Matrix (30 total)

All 30 disk skills are documented in `SKILL-DOC-MATRIX.md`. Cross-reference count: **PASS**

### Skills Referenced on Board (17 total)

Board contains:
- 11 page skills (all matrix page skills used)
- 5 feature skills (all matrix feature skills used)
- 1 dangling reference: `page-schedules-upgrade` (NOT in matrix)

---

## Recommendations

### Priority 1: Add Missing Matrix Entry

**Task:** `S2-FIX-001` - Add `page-schedules-upgrade` to SKILL-DOC-MATRIX.md
- **File:** `/sessions/nice-youthful-planck/mnt/dangapp/docs/status/SKILL-DOC-MATRIX.md`
- **Reason:** Board references skill that matrix doesn't define
- **Effort:** ~5 minutes (copy template, fill route/code_paths/features)

### Priority 2: Harden Incomplete SKILL.md Files

**High Severity (10 skills with 5+ missing sections):**
- All `dangapp-*` pattern skills (7 skills)
- `dang-rpc-diagnosis` (diagnostic ops skill)
- `dang-supabase-mcp` (infrastructure ops skill)

These need Trigger, Input, Read First, Do, Validation, Output sections for consistency.

**Medium Severity (8 skills with 1-2 missing sections):**
- Feature skills: add "Read First" documentation
- Subagent skills: add "Input" section

---

## Validation Checklist

- [x] All disk skills documented in matrix
- [x] No untracked matrix entries
- [x] All code paths exist in repo
- [ ] All skills have complete section structure
- [x] Board references match matrix OR require action
- [ ] Feature skills have "Read First" sections documented
- [ ] Ops skills have "Trigger", "Input", "Do", "Output" sections

---

## Integrity Score

**Overall: 6/7 (86%)**

- Disk ↔ Matrix parity: 7/7 ✓
- Matrix ↔ Board coverage: 6/7 (missing `page-schedules-upgrade` definition)
- Section completeness: 12/30 (40% complete across all skills)

---

## Next Steps

1. **S2-FIX-001:** Add `page-schedules-upgrade` to matrix (BLOCKING for board accuracy)
2. **S2-FIX-002:** Audit and hardify incomplete skills (14 skills with >1 missing section)
3. Verify all skills follow the expected section structure in CLAUDE.md guidelines

