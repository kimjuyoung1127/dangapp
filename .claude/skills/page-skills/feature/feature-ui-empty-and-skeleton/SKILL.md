---
name: feature-ui-empty-and-skeleton
description: Add intentional empty states and skeleton loading patterns for DangApp routes and feature modules. Use when live data can be absent, delayed, or partially loaded and the UI needs a polished placeholder state.
---

# feature-ui-empty-and-skeleton

## Trigger
- Route needs skeleton loading state
- Data may legitimately be empty
- Mock placeholder UI needs production-ready empty/loading behavior

## Inputs
- Target route or feature module
- Current hook state shape
- Existing skeleton or empty-state components nearby

## Procedure
1. Separate loading, empty, partial, and populated states.
2. Use skeletons where data is expected soon and layout should stay stable.
3. Use empty states where no records are a valid outcome.
4. Match copy and CTA behavior to the feature's next best action.
5. Keep empty and skeleton states visually consistent with the route's production UI.

## Validation
- No route falls through to blank UI while loading.
- Empty states are deliberate and actionable.
- Skeleton shapes match the final layout enough to reduce jank.
- Loading and empty states are not conflated.

## Output
- Scope:
- Files:
- Validation:
- Risks:
