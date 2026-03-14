---
name: feature-data-binding-and-loading
description: Replace mock or hardcoded route data with live TanStack Query and mutation flows backed by stable hooks.
---

# feature-data-binding-and-loading

## Trigger
- Replace mock data with live data.
- Add `useQuery` or `useMutation`.
- Wire a route to Supabase-backed hooks.

## Inputs
- Route and parity ID
- Target page or feature files
- Existing hooks, constants, and schemas

## Read First
1. The target route or feature entry file
2. The nearest hook in `frontend/src/lib/hooks`
3. `frontend/src/types/database.types.ts` when the change touches Supabase-backed data

## Procedure
1. Identify mock constants, loading stubs, and hardcoded demo records.
2. Map each UI state to the correct hook or query source.
3. Use stable query keys and centralize data access in hooks or libs.
4. Handle loading, error, empty, and success branches explicitly.
5. Invalidate or refetch only the affected queries after mutations.

## Validation
- No mock data remains in the final path.
- Loading, error, empty, and success states all render intentionally.
- Query keys are stable and scoped to the feature.
- Components do not call Supabase directly when a hook should own the flow.

## Output
- Scope:
- Files:
- Validation:
- Risks:
