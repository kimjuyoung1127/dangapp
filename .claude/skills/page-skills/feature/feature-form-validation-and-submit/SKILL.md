---
name: feature-form-validation-and-submit
description: Build or upgrade DangApp forms with intentional validation, submit flow, and post-submit handling.
---

# feature-form-validation-and-submit

## Trigger
- Add a new form or upgrade an existing form.
- Connect submit behavior to live mutations.
- Add validation, submit disabling, or success handling.

## Inputs
- Form surface and parity ID
- Related schema or hook files
- Success and failure expectations

## Read First
1. The target form component or route
2. The schema or validation utility backing the form
3. Any existing submit hook or server action used by the flow

## Procedure
1. Define the data contract and validation boundary first.
2. Use RHF and the matching schema or typed validation path.
3. Keep field errors, submit disabled state, and submit progress explicit.
4. Connect submit behavior through hooks or service layers, not directly in presentational components.
5. Handle success transitions intentionally: close sheet, redirect, refetch, or show confirmation.

## Validation
- Invalid input is blocked before mutation.
- Submit button state reflects pending work.
- Success and failure feedback are visible.
- Post-submit state is consistent with the route's data refresh strategy.

## Output
- Scope:
- Files:
- Validation:
- Risks:
