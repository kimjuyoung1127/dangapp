---
name: feature-error-and-retry-state
description: Add explicit error, recovery, and retry behavior for DangApp routes and feature modules.
---

# feature-error-and-retry-state

## Trigger
- API or hook failures need visible handling.
- A route should recover from failed load or submit.
- Retry UI or inline recovery is missing.

## Inputs
- Failing page or feature module
- Relevant hook or mutation path
- Product expectation from board or status docs

## Read First
1. The target route or component render branches
2. The hook that owns the failing query or mutation
3. Existing retry UI patterns already used in nearby routes

## Procedure
1. Enumerate failure points for initial load, background refresh, and submit paths.
2. Show a user-facing error state for each meaningful failure case.
3. Add retry actions that call the correct query refetch or mutation retry path.
4. Prevent infinite spinners or silent failure fallthrough.
5. Separate empty state from error state.

## Validation
- Failed load and failed submit states are distinguishable.
- Retry actions are wired and testable.
- Empty state is not reused as an error state.
- No uncaught promise path leaves the UI in an ambiguous state.

## Output
- Scope:
- Files:
- Validation:
- Risks:
