# Subagent Patterns

Reusable decision rules for subagent-style exploration in DangApp.

## Decision Tree
1. Is the task a single-file edit, a small code tweak, or a simple Git action?
   - Yes -> do not use subagent exploration.
   - No -> continue.
2. Does the task require comparing code, docs/status, and local `CLAUDE.md` guidance?
   - Yes -> use `subagent-doc-check`.
   - No -> continue.
3. Does the task require finding existing implementation patterns before building?
   - Yes -> use `subagent-pattern-collect`.
   - No -> continue.
4. Does the task span three or more file groups and end in comparison or summarization?
   - Yes -> use the fixed split `SubA/SubB/SubC`.
   - No -> keep the work in the main agent.

## Fixed File Groups
### SubA - Code Facts
- `frontend/src/app/**/page.tsx`
- `frontend/src/app/**/route.ts`
- `frontend/src/components/features/**`
- `frontend/src/lib/hooks/**`
- `frontend/src/lib/constants/**`
- `frontend/src/types/**`
- `supabase/**` schema and migration files

### SubB - Docs and Status Facts
- `docs/status/PROJECT-STATUS.md`
- `docs/status/PAGE-UPGRADE-BOARD.md`
- `docs/status/11-FEATURE-PARITY-MATRIX.md`
- `docs/status/SKILL-DOC-MATRIX.md`
- `docs/ref/SCHEMA-CHANGELOG.md`

### SubC - Local Rule Chain
- `CLAUDE.md`
- `docs/CLAUDE.md`
- `docs/status/CLAUDE.md`
- `frontend/CLAUDE.md`
- `frontend/src/components/features/*/CLAUDE.md`

## Prompt Examples
### Consistency Check
```text
Run subagent-doc-check.
SubA: collect actual route, feature, hook, and schema facts.
SubB: collect board, matrix, project-status, and schema-changelog facts.
SubC: collect root/docs/frontend/features CLAUDE guidance.
Return only drift items and recommended edit surfaces.
```

### Route Pattern Collection
```text
Run subagent-pattern-collect in route-page mode.
Target route: /chat
Collect closest existing page, feature, hook, and doc patterns.
Return checklist, representative files, cautions, and reusable summary.
```

### Data Contract Pattern Collection
```text
Run subagent-pattern-collect in data-contract mode.
Collect migration, database types, schema changelog, and status expectations.
Return contract patterns and cautions before implementation.
```

## Skip Cases
- One-file refactors
- Small bug fixes with already-known target files
- Simple status doc updates
- Plain Git inspection or branch work
- Straightforward implementation where the existing pattern is already obvious
