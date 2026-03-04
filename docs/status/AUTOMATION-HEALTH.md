# Automation Health Report

**Generated**: 2026-03-03T17:09:XX KST  
**Run**: Dawn Sweep — STEP 7

---

## Overall Health: 77%

---

## Status Table

| ID | Automation | Lock | Freshness | History | Score |
|----|-----------|------|-----------|---------|-------|
| A1 | INTEGRITY-REPORT (code-doc-align) | ✅ CLEAR | ✅ FRESH | ✅ | 90/90 |
| A2 | NIGHTLY-RUN-LOG (docs-nightly) | ⚠️ MISSING | ✅ FRESH | ❌ | 40/90 |
| A3 | WAVE-SYNC-LOG (wave-status-sync) | ✅ CLEAR | ✅ FRESH | ✅ | 90/90 |
| A4 | PARITY-CASCADE-LOG (parity-cascade) | ✅ CLEAR | ✅ FRESH | ✅ | 90/90 |
| A5 | SKILL-DOC-INTEGRITY-REPORT | ✅ CLEAR | ✅ FRESH | ❌ | 70/90 |
| A6 | SCHEMA-DRIFT-REPORT | ✅ CLEAR | ✅ FRESH | ✅ | 90/90 |
| A7 | MEMORY-DRIFT-REPORT | ✅ CLEAR | ✅ FRESH | ❌ | 70/90 |

---

## Alerts (1)

- ⚠️ **A2 (docs-nightly)**: Lock file `.docs-nightly.lock` is missing — the nightly automation may not have a proper lock mechanism. NIGHTLY-RUN-LOG.md exists and is fresh, but no history tracking.

---

## Recommendations

1. Create `.docs-nightly.lock` for the docs-nightly automation to enable proper stuck-lock detection.
2. Add `SKILL-DOC-INTEGRITY-HISTORY.ndjson` and `MEMORY-DRIFT-HISTORY.ndjson` history files for A5/A7.
3. All artifacts are FRESH — Dawn Sweep ran successfully this cycle.

---

## History

All automations ran this cycle with artifact freshness under 1h.

