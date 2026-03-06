# DangApp Orchestration Index (Slim)

DangApp execution rules, priorities, and source-of-truth pointers.

## Session Handoff (Read First)

If this file is shown in a new session, continue work in this exact order:
1. Read `docs/status/PROJECT-STATUS.md` and `docs/status/PAGE-UPGRADE-BOARD.md`.
2. Run preflight checks:
   - `git status --short`
   - `cd frontend && npx tsc --noEmit -p ./tsconfig.json`
3. Continue the next unfinished priority/parity item.
4. Update `docs/daily/MM-DD/page-<route>.md` and board status before finishing.

Current checkpoint (as of 2026-03-05):
- Security hardening + B2B QA blockers resolved (`/family` unblocked).
- Auth QA completed (Kakao deferred).
- Chat/DangLog debug seed workflow implemented and data injected.

Immediate next actions:
1. `DANG-CHT-001`: resolve runtime case where `/chat` still shows empty despite seeded participant rows.
2. Validate active session user -> `useCurrentGuardian()` -> `guardian.id` mapping and chat query runtime path.
3. Keep docs/status and daily logs synced after chat issue is closed.

Supabase MCP prerequisites:
- `SUPABASE_ACCESS_TOKEN` must be set in shell env.
- MCP config files:
  - `.mcp.json`
  - `docs/ref/SUPABASE-MCP-RUNBOOK.md`

Do not skip:
- parity ID mapping in every implementation change
- daily log + board sync at task end

## Repo Boundary (MUST)

| Scope | Path (WSL) | Path (Windows) | Access |
|---|---|---|---|
| Write Repo | `/mnt/c/Users/gmdqn/dangapp` | `C:\Users\gmdqn\dangapp` | read/write |
| Reference Landing | `/mnt/c/Users/gmdqn/dang` | `C:\Users\gmdqn\dang` | read-only reference |

Dual-agent handoff: `docs/ref/DUAL-AGENT-HANDOFF.md`

## Execution Rules (MUST)
1. Announce change intent in 1-2 lines before editing.
2. Read source files before editing them.
3. Link every implementation to parity IDs.
4. Prefer reuse over duplication.
5. No destructive git or mass-delete operations without explicit request.
6. Keep `CLAUDE.md` files slim and move details into docs.
7. If creating a new folder, add a local `CLAUDE.md` with role/rules.
8. Use design tokens; avoid hardcoded hex/font-size in components.
9. For page implementation, load one `page-*` skill + at most two `feature-*` skills.
10. At task end, output Completion Format and sync `docs/daily/MM-DD/page-<route>.md` with `docs/status/PAGE-UPGRADE-BOARD.md`.

## Subagent Rules
- Use subagent-style exploration when work requires:
  - code vs docs vs `CLAUDE.md` rule-chain comparison
  - reading three or more file groups before comparing or summarizing
  - collecting existing implementation patterns before adding a new route, feature module, or data-contract change
- Keep the split fixed when subagent exploration is used:
  - `SubA`: code facts
  - `SubB`: docs/status facts
  - `SubC`: local `CLAUDE.md` rule-chain facts
- Keep direct mutation in the main agent. Subagent-style work is for discovery, comparison, and pattern collection.
- Skip subagent exploration for:
  - single-file edits
  - simple Git operations
  - straightforward code implementation that does not need repo-wide comparison
- Prefer:
  - `subagent-doc-check` for consistency and drift checks
  - `subagent-pattern-collect` for implementation pattern gathering

## Architecture Snapshot

| Layer | Stack |
|---|---|
| Framework | Next.js 14 App Router |
| UI | Tailwind + CVA + Motion wrappers |
| State | Zustand + TanStack Query |
| Backend | Supabase (Auth/DB/Realtime/Storage) |

## Current Priority (Last Updated: 2026-03-02)
1. DANG-INFRA-001: schema expansion + RLS + storage policies.
2. DANG-ONB-001: high-completion onboarding with progressive gates.
3. DANG-MAT-001 + DANG-CHT-001: matching/filter/chat/schedule continuity.
4. DANG-WLK-001 + DANG-DLG-001: walk record/review + collaborative danglog.
5. DANG-B2B-001: partner-place flow and operator model.

## Source of Truth Docs

| Document | Purpose |
|---|---|
| `docs/status/PROJECT-STATUS.md` | latest status board |
| `docs/status/11-FEATURE-PARITY-MATRIX.md` | parity notes and verification logs |
| `docs/status/MISSING-AND-UNIMPLEMENTED.md` | missing implementations and V2 candidates |
| `docs/status/PAGE-UPGRADE-BOARD.md` | route-level execution board |
| `docs/status/SKILL-DOC-MATRIX.md` | page skill to code/doc mapping |
| `docs/status/DANGAPP-MASTER-EXECUTION-PLAN.md` | execution master plan |
| `docs/status/DANGAPP-MASTER-EXECUTION-REVIEW.md` | plan review results |
| `docs/ref/SCHEMA-CHANGELOG.md` | schema and migration notes |
| `docs/ref/SUPABASE-MCP-RUNBOOK.md` | MCP setup and operation runbook |
| `docs/ref/WSL-CODEX-ENCODING-RUNBOOK.md` | WSL-first encoding-safe Codex workflow |

## Local Folder Rules
- `frontend/e2e/claude.md`
  - Owns browser E2E route QA scope (`@unauth`, optional `@signed`, manual auth-state recording).
  - Keeps tests route-centric and skippable when signed-in storage state is unavailable.

## Completion Format

```text
- Scope: parity IDs
- Files: changed files
- Validation: commands/tests and outcomes
- Daily Sync: docs/daily/MM-DD/page-<route>.md + board status
- Risks: unresolved risks and next actions
- Self-Review: good / weak / verification gaps
- Next Recommendations: top 1-3 priorities
```
