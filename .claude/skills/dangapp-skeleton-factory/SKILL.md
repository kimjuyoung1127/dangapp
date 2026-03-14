---
name: dangapp-skeleton-factory
description: Skeleton state pattern that mirrors the final layout closely so loading transitions feel stable and intentional.
---

# dangapp-skeleton-factory

## Trigger
- A feature needs a new loading state.
- Existing loading placeholders do not resemble the final UI.
- A route flickers because the skeleton and resolved layout differ too much.

## Inputs
- Target feature or route
- Final success-state layout to mirror
- Existing shared skeleton primitives

## Read First
1. `frontend/src/components/ui/Skeleton.tsx`
2. The target route or component success state
3. Nearby loading implementations for the same feature family

## Procedure
1. Mirror the real layout shape, spacing, and major block sizes.
2. Keep the skeleton lightweight and free of fake content that changes the visual rhythm.
3. Match the number of placeholder items to the expected first render where practical.
4. Remove skeletons once the resolved state is stable instead of layering both states together.

## Validation
- Skeleton dimensions roughly match the resolved UI.
- Loading, empty, and success states are visually distinct.
- No duplicate content flashes during transition.
- The loading state is reusable enough for the feature family.

## Output
- Scope:
- Skeleton states:
- Validation:
- Risks:
