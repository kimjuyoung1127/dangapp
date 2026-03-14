---
name: dang-rpc-diagnosis
description: Diagnose Supabase RPC and query paths that return empty data, wrong data, or runtime errors.
---

# dang-rpc-diagnosis

## Trigger
- A Supabase RPC returns empty results, partial results, or a runtime error.
- A route looks healthy in code but the UI shows blank, stale, or mismatched data.
- A database-side fix needs a repeatable diagnosis and verification path.

## Inputs
- Failing route, hook, or component path
- RPC name or table/query path involved
- Repro steps, console errors, and related status docs

## Read First
1. `sections/00-overview.md`
2. `sections/10-diagnosis-runbook.md`
3. `sections/20-fix-patterns.md`
4. `sections/30-verification.md`

## Procedure
1. Confirm the runtime symptom and isolate the exact RPC or query path.
2. Trace the call from UI to hook to Supabase client usage before proposing a fix.
3. Check likely failure classes in order: auth context, RLS, filters, joins, null handling, and response shape drift.
4. Apply the narrowest fix that restores the intended data contract.
5. Re-run the affected flow and verify that empty, error, and success states now align with the backend result.

## Validation
- The failing RPC or query path is identified explicitly.
- The root cause is classified, not guessed.
- The fix is verified with the narrowest relevant test or manual repro.
- Follow-up doc updates are called out when behavior changed.

## Output
- Scope:
- Symptom:
- Root cause:
- Fix:
- Validation:
- Risks:
