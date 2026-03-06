---
name: page-onboarding-upgrade
description: Upgrade /onboarding route UI, data flow, and route-specific behavior for parity work. Use when implementing or stabilizing /onboarding and its directly related feature modules and hooks.
---

# page-onboarding-upgrade

## Trigger
- Improve or finish /onboarding
- Resolve parity work for DANG-ONB-001
- Stabilize the route before QA or Done

## Input Context
- Route: /onboarding
- Page file: frontend/src/app/(auth)/onboarding/page.tsx
- Parity: DANG-ONB-001
- Priority: P0

## Read First
1. docs/status/PAGE-UPGRADE-BOARD.md
2. docs/status/SKILL-DOC-MATRIX.md
3. docs/status/PROJECT-STATUS.md
4. frontend/src/app/(auth)/onboarding/page.tsx

## Related Files
- frontend/src/app/(auth)/onboarding/page.tsx
- frontend/src/components/features/onboarding/*
- frontend/src/stores/useOnboardingStore.ts
- frontend/src/lib/hooks/useOnboarding.ts

## Recommended Feature Skills
- feature-form-validation-and-submit
- feature-navigation-and-gesture

## Procedure
1. Confirm the route's current status and parity expectations from board and status docs.
2. Limit edits to the route and the directly related feature modules, hooks, and supporting files.
3. Implement explicit loading, empty, error, and success behavior where relevant.
4. Reuse existing shared components and hooks before adding new abstractions.
5. Keep docs and daily evidence in sync when route behavior or parity status changes.

## Acceptance Focus
- progressive completion, photo upload, consent logging
- Route behavior matches current status docs.
- No mock or hardcoded fallback remains in the production path.

## Validation
- cd frontend && npx tsc --noEmit
- Run the narrowest relevant test or lint path available.
- Verify route behavior manually if no automated check exists.
- Update route docs if status or evidence changed.

## Output
- Scope: DANG-ONB-001
- Files:
- Validation:
- Daily Sync:
- Risks:
- Self-Review:
- Next Recommendations:
