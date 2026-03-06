---
name: feature-error-and-retry-state
description: Add explicit error, recovery, and retry behavior for DangApp routes and feature modules. Use when a page or component needs resilient loading failure handling, retry actions, or recoverable empty/error branches.
---

# feature-error-and-retry-state

## Trigger
- API or hook failures need visible handling
- Route should recover from failed load or submit
- Retry UI or inline recovery is missing

## Inputs
- Failing page or feature module
- Relevant hook or mutation path
- Product expectation from board or status docs

## Procedure
1. Enumerate failure points for initial load, background refresh, and submit paths.
2. Show a user-facing error state for each meaningful failure case.
3. Add retry actions that call the correct query refetch or mutation retry path.
4. Prevent infinite spinners or silent failure fallthrough.
5. Separate empty state from error state.
6. Log or surface blockers that should keep the route from moving to QA or Done.

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
