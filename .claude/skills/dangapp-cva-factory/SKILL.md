---
name: dangapp-cva-factory
description: Build reusable UI primitives with class-variance-authority and a shared `cn()` merge path instead of ad hoc class branching.
---

# dangapp-cva-factory

## Trigger
- Create or refactor a reusable UI primitive.
- A component already has branching class logic that should become variants.
- A shared component needs a stable API for size, tone, or state variations.

## Inputs
- Target component file
- Variant dimensions such as intent, size, state, or radius
- Shared utilities already used in the codebase

## Read First
1. Existing UI primitives in `frontend/src/components/ui`
2. `frontend/src/lib/utils.ts` if `cn()` lives there
3. Nearby component tests if the primitive already has coverage

## Procedure
1. Define base classes once and move variation logic into CVA variants.
2. Merge external `className` through the shared `cn()` helper.
3. Keep variant names semantic and stable so route code stays readable.
4. Expose only the smallest prop surface needed for reuse.

## Validation
- No inline template-string class branching remains for modeled variants.
- External `className` still composes cleanly.
- Variant defaults are explicit.
- Existing consumers do not lose behavior or styling coverage.

## Output
- Scope:
- Component:
- Variants:
- Validation:
- Risks:
