---
# File: Skill instructions for folder/file guardrails and pattern-to-skill promotion.
name: dang-folder-file-guardrails
description: Enforce local CLAUDE.md in new folders, require top-of-file description comments, and promote repeatable good patterns into reusable skills.
---

# dang-folder-file-guardrails

## Trigger
Use this skill when work includes one or more of the following:
- Creating a new folder.
- Creating one or more new files.
- Discovering a repeatable pattern worth skill-izing.

## Inputs
- Target folder(s) and file(s) to create.
- Parent domain (`frontend`, `docs`, `.claude/skills`, etc.).
- Existing conventions from root `CLAUDE.md`.

## Procedure
1. **New folder guardrail**
   - For every new folder, create a local `CLAUDE.md` in that folder.
   - Document purpose, structure, and responsibilities.

2. **New file guardrail**
   - Add a short top-of-file description comment in every newly created file.
   - Choose the matching comment syntax by file type:
     - TypeScript/JavaScript: `// File: ...`
     - SQL/Shell/Python/YAML: `# File: ...`
     - Markdown/HTML: `<!-- File: ... -->`

3. **Pattern capture and promotion**
   - If a pattern is reused at least twice or prevents recurring mistakes, promote it to a skill.
   - Create skill folder under `.claude/skills/<group>/...`.
   - Add `SKILL.md` with trigger, inputs, procedure, and validation checklist.
   - Add local `CLAUDE.md` to the new skill folder.
   - Register the skill in `docs/status/SKILL-DOC-MATRIX.md` (Ops Skills section if cross-cutting).

4. **Verification checklist**
   - Confirm each new folder has `CLAUDE.md`.
   - Confirm each new file starts with a description comment.
   - Confirm promoted skill is discoverable from matrix/docs.

## Output Template
- Scope:
- Created folders/files:
- Guardrails applied:
- Skill promotions:
- Verification:
