---
name: dangapp-supabase-hook
description: Encapsulate Supabase data access in TanStack Query hooks so routes and components consume stable server-state APIs instead of inline client calls.
---

# dangapp-supabase-hook

## Trigger
- A route or component is calling Supabase directly.
- A new server-state path needs query or mutation hooks.
- Query keys, invalidation, or error handling need normalization.

## Inputs
- Target feature files
- Table or RPC contract involved
- Existing query key and cache invalidation patterns

## Read First
1. The nearest hook in `frontend/src/lib/hooks`
2. `frontend/src/types/database.types.ts`
3. Components currently consuming the data path

## Procedure
1. Move fetch and mutation logic into a dedicated hook.
2. Use stable query keys that match existing feature conventions.
3. Keep Supabase response shaping close to the hook boundary.
4. Expose the minimum data and mutation API that consuming components need.

## Validation
- Components no longer own direct Supabase data access for that path.
- Query keys and invalidation are explicit.
- Hook return types stay aligned with the database contract.
- Loading and error states remain consumable by the UI.

## Output
- Scope:
- Hook surface:
- Validation:
- Risks:
