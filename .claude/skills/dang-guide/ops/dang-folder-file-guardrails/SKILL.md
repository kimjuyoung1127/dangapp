---
name: dang-folder-file-guardrails
description: Enforce local guidance files for new folders, require top-of-file description comments, and promote repeatable patterns into reusable skills.
---

# dang-folder-file-guardrails

## Trigger
- Creating a new folder.
- Creating one or more new files.
- Discovering a repeatable pattern worth promoting into a skill.

## Inputs
- Target folders and files to create.
- Parent domain such as `frontend`, `docs`, or `.claude/skills`.
- Existing conventions from root and local guidance files.

## Read First
1. `CLAUDE.md`
2. The nearest local `CLAUDE.md` in the target area
3. `docs/status/SKILL-DOC-MATRIX.md` when promoting a new skill

## Procedure
1. Add a local `CLAUDE.md` for each brand-new folder when the surrounding area does not already provide equivalent guidance.
2. Add a short top-of-file description comment to every new source or doc file.
3. When a pattern becomes reusable, create a skill folder, write `SKILL.md`, and register it in the matrix.
4. Check that the new artifact is discoverable and consistent with existing repo structure.

## Validation
- New folders have the required local guidance coverage.
- New files start with a short description comment where appropriate.
- Promoted skills are registered in discoverability docs.
- No new artifact lands without enough instructions for the next agent.

## Output
- Scope:
- Created folders/files:
- Guardrails applied:
- Skill promotions:
- Validation:
