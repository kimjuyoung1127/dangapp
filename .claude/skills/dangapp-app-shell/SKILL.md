---
name: dangapp-app-shell
description: Mobile app shell pattern with a fixed top bar, bottom navigation, and content spacing that prevents overlap with route content.
---

# dangapp-app-shell

## Trigger
- Build or refactor a main mobile route layout.
- A page needs to sit inside the shared app shell without clipping under fixed chrome.
- Top bar and bottom navigation behavior must stay consistent across `/main` routes.

## Inputs
- Route page file and any shared shell components
- Required fixed chrome such as top app bar and bottom navigation
- Existing spacing, safe-area, and responsive constraints

## Read First
1. `frontend/src/components/shared/AppShell.tsx`
2. Any route currently using the shared shell
3. The nearest route-level guidance if present

## Procedure
1. Keep top app bar and bottom navigation fixed as shared layout primitives.
2. Ensure main content adds enough top and bottom padding to avoid overlap with fixed chrome.
3. Keep route-specific content inside the shell body rather than recreating shell chrome per page.
4. Preserve mobile-first spacing and safe-area handling when adjusting layout.

## Validation
- Route content is not hidden behind fixed header or nav.
- The page uses the shared shell instead of duplicating fixed layout code.
- Desktop and mobile layouts remain usable after spacing changes.
- Navigation affordances stay visually consistent with other main routes.

## Output
- Scope:
- Shell changes:
- Validation:
- Risks:
