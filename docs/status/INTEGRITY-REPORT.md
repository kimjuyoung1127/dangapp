# Code-Doc Alignment Report (INTEGRITY-REPORT)

**Generated**: 2026-03-03T17:05:XX KST  
**Run**: Dawn Sweep — STEP 3

---

## Summary

| Category | Count | Severity |
|----------|-------|----------|
| UNTRACKED (code routes not in board) | 1 | ⚠️ Warning |
| ORPHAN_BOARD (board routes not in code) | 0 | ✅ Clear |
| UNVERIFIED parity IDs | 7 | ⚠️ Warning |
| STATUS_MISMATCH (daily vs board) | 1 | ℹ️ Info |
| MOCK_RESIDUE pages | 3 | ⚠️ Warning |

---

## UNTRACKED — Warning (1)

Code routes not tracked in PAGE-UPGRADE-BOARD:

- `/danglog/[id]` — has a `page.tsx` but no board entry

---

## ORPHAN_BOARD — ✅ None

All board routes have corresponding code files.

---

## UNVERIFIED Parity IDs — Warning (7)

Board parity IDs with no "Verified" status in 11-FEATURE-PARITY-MATRIX:

- DANG-CHT-001
- DANG-DES-001
- DANG-DLG-001
- DANG-MAT-001
- DANG-ONB-001
- DANG-PRF-001
- DANG-WLK-001

> DANG-INFRA-001 is the only Verified entry.

---

## STATUS_MISMATCH — Info (1)

| Route | Daily Log Status | Board Status | Direction |
|-------|-----------------|--------------|-----------|
| `/onboarding` | QA (implied) | Done | Possible regression in daily log |

> Daily log `page-onboarding.md` shows `InProgress → QA` but board shows `Done`. Board is ahead — no action needed, board status takes precedence.

---

## MOCK_RESIDUE — Warning (3)

Pages with mock data patterns remaining:

| Route | Patterns Found |
|-------|---------------|
| `/care` | `MOCK_` (2 occurrences) |
| `/family` | `MOCK_` (5), `setTimeout.*setIsLoading` (1) |
| `/modes` | `MOCK_` (8 occurrences) |

> These are lower-priority pages (P2). Mock cleanup required before QA.

---

## Route Coverage

| Route | Code | Board | Status |
|-------|------|-------|--------|
| `/login` | ✅ | ✅ | Ready |
| `/register` | ✅ | ✅ | Ready |
| `/onboarding` | ✅ | ✅ | Done |
| `/home` | ✅ | ✅ | QA |
| `/chat` | ✅ | ✅ | QA |
| `/chat/[id]` | ✅ | ✅ | QA |
| `/schedules` | ✅ | ✅ | QA |
| `/danglog` | ✅ | ✅ | QA |
| `/danglog/[id]` | ✅ | ❌ | Untracked |
| `/profile` | ✅ | ✅ | QA |
| `/modes` | ✅ | ✅ | Ready |
| `/care` | ✅ | ✅ | Ready |
| `/family` | ✅ | ✅ | Ready |

