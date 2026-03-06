<!-- File: Local operating rules for the dang-folder-file-guardrails skill folder. -->
# dang-folder-file-guardrails

This folder stores a reusable skill for folder/file creation guardrails.

## Folder Structure
- `SKILL.md`: Trigger and procedure for applying folder/file guardrails.
- `CLAUDE.md`: Local scope, responsibilities, and maintenance notes.

## Responsibilities
1. Enforce local `CLAUDE.md` creation for every new folder.
2. Enforce top-of-file description comments for every new file.
3. Capture reusable implementation patterns and promote them into skills.

## Maintenance Notes
- Keep this folder minimal: only files required for skill execution.
- If guidance changes, update `SKILL.md` first and then sync root `CLAUDE.md` rules.
