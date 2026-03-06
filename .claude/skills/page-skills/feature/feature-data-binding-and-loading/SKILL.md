---
name: feature-data-binding-and-loading
description: Replace mock or hardcoded route data with live TanStack Query and mutation flows. Use when a page or feature needs query keys, loading/error branching, invalidation, or Supabase-backed data binding.
---

# feature-data-binding-and-loading

## Trigger
- Replace mock data with live data
- Add `useQuery` or `useMutation`
- Wire a route to Supabase-backed hooks

## Inputs
- Route and parity ID
- Target page or feature files
- Existing hooks, constants, and schemas

## Procedure
1. Identify all mock constants, `setTimeout` loading stubs, and hardcoded demo records.
2. Map each UI state to the correct hook or query source.
3. Use stable TanStack Query keys and centralize data access in hooks or libs.
4. Handle `isLoading`, `isError`, and resolved data branches explicitly.
5. Invalidate or refetch only the affected queries after mutations.
6. Re-check empty state behavior after live data replaces mock fixtures.

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
