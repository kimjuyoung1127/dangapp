---
name: dangapp-motion-wrapper
description: Shared Framer Motion wrapper pattern for route and component transitions, tap feedback, and staggered reveal behavior.
---

# dangapp-motion-wrapper

## Trigger
- Add motion to a route or reusable component.
- Replace inconsistent one-off animation code with shared wrappers.
- Tune motion around loading, reveal, or interaction states.

## Inputs
- Target component or route
- Desired interaction or transition behavior
- Existing motion wrappers and current visual language

## Read First
1. `frontend/src/components/ui/MotionWrappers.tsx`
2. Current route or component using motion
3. Nearby tests if motion state affects rendering branches

## Procedure
1. Prefer shared wrappers over bespoke per-route animation setup.
2. Use motion to clarify hierarchy, state changes, or interaction intent, not as decoration.
3. Keep durations and easing aligned with existing app patterns.
4. Respect reduced-motion and avoid blocking core interaction behind animation.

## Validation
- Motion is consistent with existing wrappers.
- The component remains usable without relying on animation timing.
- No unnecessary layout shift is introduced.
- Reduced-motion behavior remains acceptable.

## Output
- Scope:
- Motion wrappers used:
- Validation:
- Risks:
