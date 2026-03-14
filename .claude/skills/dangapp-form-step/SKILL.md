---
name: dangapp-form-step
description: Multi-step form pattern using Zustand, React Hook Form, and validation boundaries that preserve progress and partial completion state.
---

# dangapp-form-step

## Trigger
- Build or refactor onboarding or other multi-step forms.
- A flow needs partial-save state, per-step validation, or step gating.
- Form logic is drifting across components instead of staying centralized.

## Inputs
- Target form route or feature module
- Step list, required fields, and progression rules
- Existing store, schema, and submit behavior

## Read First
1. `frontend/src/stores/useOnboardingStore.ts`
2. Form components already using RHF or Zustand
3. Validation schemas tied to the flow

## Procedure
1. Separate persistent step state from transient field UI state.
2. Validate only the fields needed to advance the current step unless the flow requires more.
3. Keep step transitions deterministic and derived from data completeness, not ad hoc flags.
4. Preserve resume behavior when the user re-enters the flow.

## Validation
- Step state survives re-render and route interactions as intended.
- Validation errors appear at the right boundary.
- Required-step gating matches product rules.
- Submit payload stays aligned with the backing schema.

## Output
- Scope:
- Steps touched:
- Validation:
- Risks:
