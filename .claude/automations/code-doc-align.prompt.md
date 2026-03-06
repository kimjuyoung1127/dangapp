# code-doc-align - code and docs integrity check

## Meta
- Task: DangApp code-to-doc integrity scan
- Schedule: Daily 03:30 (Asia/Seoul)
- Role: Detect drift between implemented routes/features and status documentation, then report it
- Project root: `C:\Users\gmdqn\dangapp`

## Source of Truth
- Code truth:
  - `frontend/src/app/**/page.tsx`
  - `frontend/src/app/**/route.ts`
  - `frontend/src/components/features/**`
- Board and status docs:
  - `docs/status/PAGE-UPGRADE-BOARD.md`
  - `docs/status/11-FEATURE-PARITY-MATRIX.md`
  - `docs/status/PROJECT-STATUS.md`
- Evidence logs:
  - `docs/daily/MM-DD/page-*.md`
- Local rule chain:
  - `CLAUDE.md`
  - `docs/CLAUDE.md`
  - `docs/status/CLAUDE.md`
  - `frontend/CLAUDE.md`

## Lock
- Lock file: `docs/status/.code-doc-align.lock`
- On start write `{"status":"running","started_at":"<ISO>"}`
- On finish write `{"status":"released","released_at":"<ISO>"}`
- If the lock is already `running`, exit immediately

## Subagent Trigger
- Call `subagent-doc-check` first when the task requires all three of:
  - code facts
  - docs/status facts
  - local `CLAUDE.md` rule-chain facts
- Use the fixed split:
  - `SubA`: collect code facts
  - `SubB`: collect docs/status facts
  - `SubC`: collect local rule-chain facts
- Keep the main automation focused on comparison, drift classification, and report generation
- Skip subagent-style exploration for simple single-file checks

## Procedure

### Step 0 - Pre-check
1. Acquire the lock.
2. Confirm `DRY_RUN` mode.
3. Decide whether this run crosses the subagent trigger threshold.

### Step 1 - Collect route and feature facts
1. Build `code_routes` from `frontend/src/app/**/page.tsx`.
2. Build `api_routes` from `frontend/src/app/**/route.ts`.
3. Record feature modules from `frontend/src/components/features/**`.
4. Parse `PAGE-UPGRADE-BOARD.md` into `board_routes`.
5. Parse `11-FEATURE-PARITY-MATRIX.md` into `matrix_parity_ids`.

### Step 2 - Compare
1. `UNTRACKED_ROUTE = code_routes - board_routes`
2. `ORPHAN_BOARD = board_routes - code_routes`
3. `UNVERIFIED_PARITY = board parity ids missing from matrix evidence`
4. `RULE_DRIFT = local rule-chain guidance that conflicts with current board or code reality`

### Step 3 - Daily evidence drift
1. Read the latest `docs/daily/` date folder.
2. Parse `page-*.md` status summaries.
3. Compare daily status against board status and capture `STATUS_MISMATCH`.

### Step 4 - Mock residue
1. Search route pages and related feature modules for `MOCK_`, `dummy`, `setTimeout.*setIsLoading`, `mock-guardian`.
2. If a route is marked QA or Done while mock residue remains, record `MOCK_RESIDUE`.

### Step 5 - Report
1. If `DRY_RUN=true`, print the report body only.
2. Otherwise write `docs/status/INTEGRITY-REPORT.md` with:
   - summary counts
   - drift item lists
   - note whether subagent discovery was used
3. Append `docs/status/INTEGRITY-HISTORY.ndjson` with timestamped counts.

### Step 6 - Release
1. Release the lock file.

## Must Not
- Do not edit `frontend/src/`.
- Do not auto-change board or matrix entries.
- Do not auto-change daily logs.
- Only report drift unless the prompt is explicitly upgraded to a write-capable workflow.

## DRY_RUN=true
- Print report content only.
- Final line: `[DRY_RUN] no files changed`
