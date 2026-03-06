---
name: feature-form-validation-and-submit
description: Build or upgrade DangApp forms with intentional validation, submit flow, and post-submit handling. Use when a route or feature needs RHF, schema validation, disabled states, success feedback, or mutation wiring.
---

# feature-form-validation-and-submit

## Trigger
- Add a new form or upgrade an existing form
- Connect submit behavior to live mutations
- Add validation, submit disabling, or success handling

## Inputs
- Form surface and parity ID
- Related schema or hook files
- Success and failure expectations

## Procedure
1. Define the data contract and validation boundary first.
2. Use RHF and the matching schema or typed validation path.
3. Keep field errors, submit disabled state, and submit progress explicit.
4. Connect submit behavior through hooks or service layers, not directly in presentational components.
5. Handle success transitions intentionally: close sheet, redirect, refetch, or show confirmation.
6. Keep required consent or policy logging in the same submit flow when applicable.

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
