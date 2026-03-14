---
name: dang-supabase-mcp
description: Run Supabase MCP work in a predictable order and document each change clearly.
---

# dang-supabase-mcp

## Trigger
- The task requires schema, data, RLS, Edge Function, or advisor work through Supabase MCP tools.
- The change is production-impacting enough that preflight and QA order matter.
- A database fix needs explicit documentation of what changed and how it was verified.

## Inputs
- Target database object or feature slice
- Required Supabase tool operations
- Relevant docs, parity IDs, and repro notes

## Read First
1. `sections/00-overview.md`
2. `sections/20-runbook.md`
3. `sections/30-failure-modes.md`
4. `sections/40-qa-checklist.md`

## Procedure
1. Load the overview and confirm the allowed change surface.
2. Follow the runbook in order instead of jumping straight to schema or data edits.
3. When something fails, classify it with the failure-modes doc before retrying.
4. Finish with the QA checklist and record the exact validation performed.

## Validation
- The work followed the documented run order.
- Any failure was classified before further changes were made.
- Validation covered both the database mutation and the user-facing consequence.
- The final note names the affected objects, tools, and verification steps.

## Output
- Scope:
- MCP operations:
- Objects changed:
- Validation:
- Risks:
