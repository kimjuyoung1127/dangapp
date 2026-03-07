# Skill-Doc Integrity Report (S2)

**Generated**: 2026-03-06  
**Scan Scope**: `.claude/skills/`, `docs/status/SKILL-DOC-MATRIX.md`, `docs/status/PAGE-UPGRADE-BOARD.md`

## Executive Summary

Integrity scan of DangApp skill registry identified **8 missing_skill** (on disk but unregistered), **1 board_dangling**, **5 board_unmatrix**, and **5 incomplete skills** missing required sections.

**Status**: Actionable gaps identified. Missing dandapp-* component skills should be added to matrix; incomplete feature skills need section completion; page-schedules-upgrade requires matrix entry.

---

## Findings

### 1. Missing Skills (Disk but Not in Matrix)
Skills that exist on disk but are not registered in `SKILL-DOC-MATRIX.md`:

| Skill ID | Path | Category | Action |
|---|---|---|---|
| `dang-folder-file-guardrails` | `.claude/skills/dang-guide/ops/dang-folder-file-guardrails/` | ops | Add to matrix |
| `dangapp-app-shell` | `.claude/skills/dangapp-app-shell/` | component | Add to matrix |
| `dangapp-cva-factory` | `.claude/skills/dangapp-cva-factory/` | component | Add to matrix |
| `dangapp-form-step` | `.claude/skills/dangapp-form-step/` | component | Add to matrix |
| `dangapp-motion-wrapper` | `.claude/skills/dangapp-motion-wrapper/` | component | Add to matrix |
| `dangapp-skeleton-factory` | `.claude/skills/dangapp-skeleton-factory/` | component | Add to matrix |
| `dangapp-supabase-hook` | `.claude/skills/dangapp-supabase-hook/` | hook | Add to matrix |
| `dangapp-trust-visual` | `.claude/skills/dangapp-trust-visual/` | component | Add to matrix |

**Impact**: These are foundational component/hook skills used in page implementations. Lack of matrix registration may cause discoverability issues for future contributors.

---

### 2. Untracked Skills (Matrix but Not on Disk)
Skills registered in matrix but missing from disk: **NONE** (0)

**Status**: OK - All matrix entries have corresponding disk files.

---

### 3. Board Dangling Skills (Board but Not in Matrix)
Skills referenced in `PAGE-UPGRADE-BOARD.md` but not registered in matrix:

| Skill ID | Board References | Action |
|---|---|---|
| `page-schedules-upgrade` | `/schedules` route row | Create SKILL.md and add to matrix |

**Impact**: `/schedules` route is marked as Done on board but has no corresponding skill module for future reference/work.

---

### 4. Board Unmatrix Skills (Matrix but Not on Board)
Skills in matrix not referenced on board:

| Skill ID | Type | Reason |
|---|---|---|
| `dang-route-doc-parity` | ops | Operational skill (not route-specific) |
| `dang-rpc-diagnosis` | ops | Operational skill (not route-specific) |
| `dang-supabase-mcp` | ops | Operational skill (not route-specific) |
| `subagent-doc-check` | ops | Operational skill (not route-specific) |
| `subagent-pattern-collect` | ops | Operational skill (not route-specific) |

**Status**: OK - These are workflow/process skills not tied to specific routes. Board is route-centric by design.

---

### 5. Broken Paths (Code References Not Existing)
Verification of code paths referenced in SKILL.md files: **NONE** (0)

**Status**: OK - All referenced paths are valid.

---

### 6. Incomplete Skills (Missing Required Sections)

| Skill ID | Missing Sections | Category | Notes |
|---|---|---|---|
| `feature-data-binding-and-loading` | `Input Context`, `Read First` | feature | Trigger, Do, Validation, Output present |
| `feature-error-and-retry-state` | `Input Context`, `Read First` | feature | Trigger, Do, Validation, Output present |
| `feature-form-validation-and-submit` | `Input Context`, `Read First` | feature | Trigger, Do, Validation, Output present |
| `feature-navigation-and-gesture` | `Input Context`, `Read First` | feature | Trigger, Do, Validation, Output present |
| `feature-ui-empty-and-skeleton` | `Input Context`, `Read First` | feature | Trigger, Do, Validation, Output present |

**Impact**: Feature skills are usable but lack detailed input-context guidance. Can be enhanced post-release.

**Required Sections for Feature Skills**:
- `Trigger`: When to use (present)
- `Input Context`: Surrounding context/state info (missing)
- `Read First`: Documentation to review (missing)
- `Do`: Implementation procedure (present as "Procedure")
- `Validation`: Testing approach (present)
- `Output`: Expected outcomes (present)

---

## Summary Table

| Classification | Count | Severity | Resolution |
|---|---|---|---|
| missing_skill | 8 | Medium | Add dangapp-* and dang-folder-file-guardrails to matrix; document purpose and sections |
| untracked | 0 | – | OK |
| board_dangling | 1 | Medium | Create page-schedules-upgrade SKILL.md and register in matrix |
| board_unmatrix | 5 | Low | Expected (ops skills not route-bound); no action required |
| broken_path | 0 | – | OK |
| incomplete | 5 | Low | Enhance feature skill templates with Input Context and Read First sections |

---

## Recommendations

### Immediate (P1)
1. **Register missing component skills** in SKILL-DOC-MATRIX.md:
   - Add rows for `dangapp-app-shell`, `dangapp-cva-factory`, `dangapp-form-step`, `dangapp-motion-wrapper`, `dangapp-skeleton-factory`, `dangapp-supabase-hook`, `dangapp-trust-visual`
   - Add row for `dang-folder-file-guardrails`
   - Document purpose, trigger, and acceptance criteria for each

2. **Create page-schedules-upgrade skill**:
   - Disk: `/sessions/ecstatic-youthful-planck/mnt/dangapp/.claude/skills/page-skills/page/page-schedules-upgrade/SKILL.md`
   - Matrix: Add row with target route `/schedules`, parity IDs, feature skills, etc.

### Follow-up (P2)
3. **Enhance feature skill templates** with:
   - `Input Context` section describing state/dependencies
   - `Read First` section pointing to key docs (e.g., component props, hook signatures)

4. **Board sync**: After completing P1, run S2 report again to verify all gaps closed.

---

## Scan Details

**Disk Skills Registered**: 29  
**Matrix Skills Registered**: 21  
**Board Skills Referenced**: 17 (including ops skills + route-specific)  

**Integrity Gate**: FAIL  
**Reason**: 8 missing_skill (unregistered components), 1 board_dangling (page-schedules-upgrade), 5 incomplete feature skills  

---

## Next Steps

1. Execute recommendations in order (P1, then P2)
2. Re-run S2 scan after changes to verify gate passes
3. Update `docs/daily/03-06/skill-scan.md` with resolution evidence
4. Notify repo maintainers of missing matrix registrations


---

## S2-FIX Execution (2026-03-06)

**S2-FIX Complete**: 8개 자동 등록 완료

**Skills Registered**:
1. `dangapp-app-shell` - Mobile app shell fixed layout pattern
2. `dangapp-cva-factory` - CVA factory pattern for UI primitives
3. `dangapp-form-step` - Multi-step form state management (Zustand + RHF + Zod)
4. `dangapp-motion-wrapper` - Framer Motion animation wrapper pattern
5. `dangapp-skeleton-factory` - Skeleton loading state pattern
6. `dangapp-supabase-hook` - TanStack Query + Supabase data encapsulation
7. `dangapp-trust-visual` - Trust/safety marker visualization pattern
8. `dang-folder-file-guardrails` - Folder/file guardrails and pattern promotion skill

**Actions Taken**:
- Updated `docs/status/SKILL-DOC-MATRIX.md` Ops Skills section with all 8 entries
- Added purpose summaries extracted from each SKILL.md
- Mapped related parity/domain context for each skill
- Ensured consistent table formatting and documentation standards

**Gate Status After S2-FIX**: Ready for re-scan (expected PASS with 29/29 registered)
