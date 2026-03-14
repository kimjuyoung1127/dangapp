---
name: subagent-pattern-collect
description: Collect DangApp implementation patterns before adding new routes, feature modules, or data-contract changes.
---

# subagent-pattern-collect

## Trigger
- Research repo patterns before building a new route, feature, or hook.
- Compare multiple candidate implementation slices before choosing one.
- Build a reusable reference set instead of copying the first local example.

## Inputs
- Target surface to build or refactor
- Pattern classes to collect, such as route layout, hook design, loading states, or mutations
- Constraints from parity docs, local guides, or user requirements

## Read First
1. `CLAUDE.md`
2. `frontend/CLAUDE.md`
3. The nearest feature or route guidance files for the target area

## Procedure
1. Choose a mode: route-page, feature-module, or data-contract.
2. Read the matching code files and at least one aligned doc source.
3. Collect boundaries, data flow, acceptance expectations, and reusable snippets.
4. Summarize only the patterns and cautions needed for implementation.
5. Stop at pattern collection; do not mutate code in this step.

## Validation
- The chosen mode is explicit.
- The scan covers code plus at least one matching doc source.
- Representative files and cautions are included.
- The result is concise enough to guide implementation directly.

## Output
- Mode:
- Checklist:
- Representative files:
- Cautions:
- Reusable pattern summary:
