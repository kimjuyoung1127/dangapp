---
name: subagent-doc-check
description: Compare DangApp code, docs/status artifacts, and local guidance files before deciding what to update.
---

# subagent-doc-check

## Trigger
- A task mentions code-doc drift or status sync.
- A repo slice needs code, docs, and rule-chain comparison before editing.
- You need a structured drift report before deciding whether code or docs are the source of truth.

## Inputs
- Target feature, route, or repo slice to compare
- The docs/status artifacts expected to reflect current code
- Any specific drift suspicion such as schema, board, or guidance mismatch

## Read First
1. `CLAUDE.md`
2. `docs/status/CLAUDE.md`
3. `frontend/CLAUDE.md`

## Procedure
1. Collect code facts from routes, feature modules, hooks, types, and schema artifacts.
2. Collect docs facts from status boards, parity matrices, and schema changelogs.
3. Collect rule-chain facts from root and local guidance files.
4. Compare the three fact lanes and classify each drift item before proposing edits.
5. Prefer docs updates when code is the clear source of truth, and flag the reverse case explicitly.

## Validation
- Code, docs, and rule-chain facts were all collected.
- Each drift item names the source files involved.
- Findings separate discovery from proposed fixes.
- No stale imported-path noise remains in the output.

## Output
- Code facts:
- Docs facts:
- Rule-chain facts:
- Drift:
- Recommended edit surface:
