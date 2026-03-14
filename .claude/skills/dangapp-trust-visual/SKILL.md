---
name: dangapp-trust-visual
description: Surface trust, safety, and verification signals prominently in matching, profile, and messaging contexts.
---

# dangapp-trust-visual

## Trigger
- A route needs visible trust or safety indicators.
- Trust score, verification, or review signals are present in data but not clearly shown.
- A profile or interaction flow needs clearer confidence cues.

## Inputs
- Target UI surface
- Available trust-related data such as badges, reviews, or verification
- Existing visual primitives used for status or emphasis

## Read First
1. `frontend/src/components/features/profile/*`
2. `frontend/src/components/features/match/*`
3. Any existing badge or status chip components

## Procedure
1. Elevate the most decision-relevant trust signals near the primary action area.
2. Keep trust cues compact and scannable rather than verbose.
3. Distinguish trust, safety, and engagement signals so the UI does not blur their meaning.
4. Reuse shared status primitives before inventing route-specific visual language.

## Validation
- Important trust signals are visible without extra drilling.
- Labels and icons do not overstate the underlying data.
- The visual treatment is consistent with the rest of the app.
- Missing trust data degrades gracefully.

## Output
- Scope:
- Signals shown:
- Validation:
- Risks:
