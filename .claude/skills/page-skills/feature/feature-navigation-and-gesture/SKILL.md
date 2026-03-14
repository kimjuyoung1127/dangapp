---
name: feature-navigation-and-gesture
description: Refine route transitions, back navigation, sheet flows, and touch interactions in DangApp.
---

# feature-navigation-and-gesture

## Trigger
- Add or revise route transition behavior.
- Clean up back navigation or nested sheet flows.
- Improve mobile interaction consistency.

## Inputs
- Route flow and parity ID
- Page file plus related modal, sheet, or dialog components
- Expected entry and exit paths

## Read First
1. The target route shell and navigation entry points
2. Shared motion or gesture wrappers used nearby
3. Existing route tests that cover navigation behavior

## Procedure
1. Map the navigation flow before editing components.
2. Keep primary actions, back behavior, and close behavior consistent.
3. Ensure sheets and dialogs preserve context instead of trapping the user unexpectedly.
4. Align gesture interactions with mobile expectations and current app patterns.
5. Check route transitions and modal exits for accidental state loss.

## Validation
- Back and close behavior are predictable.
- Sheet or dialog actions do not strand the user.
- Route transitions preserve the intended state.
- Mobile interactions remain usable with one hand and short travel distance.

## Output
- Scope:
- Files:
- Validation:
- Risks:
