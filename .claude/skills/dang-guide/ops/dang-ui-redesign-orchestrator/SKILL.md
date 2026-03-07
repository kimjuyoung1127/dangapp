---
name: dang-ui-redesign-orchestrator
description: Orchestrate DangApp UI redesign work from research normalization through route mapping, reusable component planning, implementation order, and optional docs/status alignment. Use when redesign spans multiple routes, the design system, or a provided deep research report before implementation starts.
---

<!-- File: Skill instructions for DangApp UI redesign planning and orchestration. -->
# dang-ui-redesign-orchestrator

## Trigger
- "set a UI improvement plan"
- "use the deep research result to choose a redesign direction"
- "redesign several screens together"
- "lock the design system first, then define route-by-route rollout order"
- "use the research report to lock the next UI work order"

## Inputs
- Current project guidance:
  - `CLAUDE.md`
  - `frontend/CLAUDE.md`
  - `docs/status/PROJECT-STATUS.md`
  - `docs/status/PAGE-UPGRADE-BOARD.md`
- Current product implementation:
  - key route files under `frontend/src/app/**/page.tsx`
  - related feature modules under `frontend/src/components/features/**`
  - shared layout and token files such as `frontend/src/components/shared/AppShell.tsx`, `frontend/src/styles/globals.css`, and `frontend/tailwind.config.ts`
- External research inputs when provided:
  - deep research report content
  - screenshots
  - links to reference products

## Read First
1. `CLAUDE.md`
2. `frontend/CLAUDE.md`
3. `docs/status/PROJECT-STATUS.md`
4. `docs/status/PAGE-UPGRADE-BOARD.md`
5. `references/ui-reference-clusters.md`
6. `references/screen-mapping-template.md`

## Fixed DangApp UI Principles
- Treat DangApp as one product with three fused axes:
  - trust-heavy consumer service
  - matching and conversation experience
  - care booking and family utility
- Default primary direction:
  - practical trust-centric mobile service
- Default backup direction:
  - verified care marketplace
- Keep the first redesign wave focused on core user experience:
  - `/onboarding`
  - `/home`
  - `/chat`
  - `/chat/[id]`
  - `/profile`
- Keep secondary routes inheriting the same system after the first wave:
  - `/modes`
  - `/care`
  - `/family`
  - `/danglog`
  - `/schedules`
- Define shared system rules before route-by-route implementation:
  - app shell
  - top bar and bottom navigation
  - card system
  - CTA hierarchy
  - form fields
  - trust signals
  - empty, loading, and error states

## Modes
Choose one or more explicit modes before producing the result.

### 1. `research`
- Normalize external research into DangApp-ready visual directions.
- Group findings into:
  - `trust-heavy consumer service`
  - `matching and conversation experience`
  - `booking and family utility experience`

### 2. `screen-mapping`
- Map reference products and patterns to actual DangApp routes.
- Prioritize current route status and existing implementation shape.

### 3. `implementation-guide`
- Translate the chosen direction into reusable component candidates and rollout order.
- Keep the result implementation-ready without writing code.

### 4. `doc-check`
- Compare the redesign plan against `docs/status` expectations when route ownership, priorities, or naming might drift.

## Procedure
1. **Ground the product**
   - Read project guidance and route status first.
   - Identify the actual route groups, existing app shell pattern, and current token choices.
2. **Normalize research**
   - Convert external findings into 2-3 viable visual territories.
   - Remove decorative references that do not support trust, scheduling, or real service clarity.
3. **Rank the direction**
   - Pick one primary direction and one backup direction.
   - Explain why the chosen direction fits DangApp better than the alternatives.
4. **Map screens**
   - Use `references/screen-mapping-template.md`.
   - Cover the first-wave routes first, then secondary inheritance routes.
   - For each route, name the best references, the patterns to borrow, and the patterns to avoid copying literally.
5. **Define the shared system**
   - Propose reusable component candidates and design rules for shell, cards, CTA hierarchy, forms, trust indicators, and state handling.
   - Reuse existing DangApp skills when they already cover a building block:
     - `dangapp-app-shell`
     - `dangapp-cva-factory`
     - `dangapp-motion-wrapper`
     - `dangapp-skeleton-factory`
     - `dangapp-trust-visual`
6. **Set implementation order**
   - Sequence the work as:
     - design system and shared primitives
     - first-wave core routes
     - second-wave utility routes
     - skill iteration after real usage
   - Include explicit completion criteria per wave.
7. **Optional doc check**
   - If redesign planning changes route priority, naming, or ownership assumptions, compare against `docs/status`.
   - Report drift rather than silently changing the plan.

## Must Not
- Do not jump directly into component code before ranking the visual direction and route priorities.
- Do not rely on generic moodboards or decorative-only references.
- Do not let booking/family utility screens drift into a different product language from matching/chat/profile.
- Do not treat one existing route as the whole design system without verifying cross-route consistency.

## Validation
- The output states the chosen mode set.
- The output includes:
  - `Executive Summary`
  - `Visual Direction Ranking`
  - `Screen-by-Screen Mapping`
  - `Reusable Component Candidates`
  - `Implementation Order`
  - `Anti-Patterns`
  - `Source Links`
- First-wave routes are covered explicitly.
- Every major route in the first wave includes at least two usable reference patterns or one strong reference plus one existing DangApp pattern.
- The result is specific enough that an implementer can start with shared UI work without asking for new design decisions.

## Output
```markdown
## Executive Summary
- product direction
- why this direction wins

## Modes Used
- research
- screen-mapping
- implementation-guide
- doc-check (optional)

## Visual Direction Ranking
1. primary direction
2. backup direction
3. rejected alternative

## Screen-by-Screen Mapping
| Route | Best reference(s) | Borrow | Avoid | Existing DangApp anchor |

## Reusable Component Candidates
- shell
- cards
- CTA hierarchy
- trust surfaces
- state components

## Implementation Order
- Wave 1
- Wave 2
- Wave 3

## Anti-Patterns
- item

## Doc/Status Check
- drift item or `none`

## Source Links
- link
```
