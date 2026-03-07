# Schema Drift Report — S1 Dawn Sweep (2026-03-06)

## Executive Summary

Schema drift detection analysis across three sources:
- **Types** (frontend/src/types/database.types.ts): 30 tables
- **Hooks** (frontend/src/lib/hooks/*.ts): 30 table references
- **Documentation** (docs/ref/SCHEMA-CHANGELOG.md): 15 tables

| Category | Count | Status |
|----------|-------|--------|
| UNUSED | 3 | Tables in types but not used in hooks |
| UNTYPED | 3 | Tables used in hooks but not in types |
| UNDOCUMENTED | 15 | Tables in types but not documented |
| STALE | 0 | Tables documented but not in types |

---

## Detailed Findings

### UNUSED (3 tables)
Tables defined in `database.types.ts` but **not referenced** in any hook file.

- `blocks` — User blocking relationship table; not yet queried
- `notifications` — In-app notification inbox; UI binding pending
- `reports` — User report/moderation table; not yet queried

**Action**: Verify if these are intentionally pre-typed for future use or should be removed.

---

### UNTYPED (3 tables)
Tables **referenced in hooks** but **not defined** in `database.types.ts`.

- `danglog-images` — DangLog image attachments; used in useDangLog.ts
- `dog-profiles` — Dog profile data; used in multiple hooks
- `walk-records` — Walk record snapshots; used in useWalkRecord.ts

**Action**: Add type definitions for these 3 tables to `database.types.ts` immediately. These are active production tables.

---

### UNDOCUMENTED (15 tables)
Tables **defined in types** but **not documented** in SCHEMA-CHANGELOG.md.

- `consent_logs` — Auth consent tracking
- `danglog_collaborators` — Co-author mapping
- `danglogs` — Walk/activity log entries
- `dog_ownership` — Dog-guardian N:M relationship
- `dogs` — Dog profile core table
- `guardians` — Guardian/user profile enrichment
- `matches` — Matching result snapshots
- `notification_settings` — User notification preferences
- `partner_places` — B2B location (cafe/clinic) registry
- `reports` — User report/moderation
- `reservations` — B2B reservation pipeline
- `reviews` — Peer review records
- `schedule_participants` — Multi-user schedule mapping
- `users` — Core user/auth table
- `walk_records` — Walk session records

**Action**: Document these tables in SCHEMA-CHANGELOG.md with purpose, key columns, and parity ID. Most are Wave 1 core tables (DANG-ONB-001, DANG-MAT-001, etc.).

---

### STALE (0 tables)
No tables documented that are missing from types. ✓

---

## Drift Analysis

### Key Insights

1. **Type Definition Gap**: 3 active production tables (`danglog-images`, `dog-profiles`, `walk-records`) lack type safety. These are currently used in hooks but untyped.

2. **Documentation Gap**: 15 core tables (50% of typed tables) lack individual documentation entries. This creates a divergence between types and changelog as the source of truth.

3. **Naming Inconsistency**: Hook usage shows both hyphenated (`walk-records`, `dog-profiles`) and snake_case (`walk_records`) variants. Type definitions use snake_case exclusively.

4. **Unused Tables**: `blocks`, `notifications`, and `reports` are pre-typed but unused, suggesting future features (friend blocking, notifications UI, moderation).

---

## Remediation Roadmap

### Immediate (P0)
1. Add type definitions for untyped tables:
   - `danglog-images`
   - `dog-profiles`
   - `walk-records`
2. Standardize hook `.from()` references to use consistent table names (prefer snake_case per types).

### Short-term (P1)
1. Document all 15 undocumented tables in SCHEMA-CHANGELOG.md with:
   - Purpose
   - Key columns
   - Associated parity ID
   - Status/wave

### Medium-term (P2)
1. Verify unused tables (`blocks`, `notifications`, `reports`) roadmap:
   - If deferred: move to V2 candidates doc
   - If active: link to issues and document
2. Enable auto-generation of database.types.ts from Supabase CLI (noted in file header).

---

## Drift Metrics

```json
{
  "unused": 3,
  "untyped": 3,
  "undocumented": 15,
  "stale": 0,
  "unused_list": [
    "blocks",
    "notifications",
    "reports"
  ],
  "untyped_list": [
    "danglog-images",
    "dog-profiles",
    "walk-records"
  ],
  "undocumented_list": [
    "consent_logs",
    "danglog_collaborators",
    "danglogs",
    "dog_ownership",
    "dogs",
    "guardians",
    "matches",
    "notification_settings",
    "partner_places",
    "reports",
    "reservations",
    "reviews",
    "schedule_participants",
    "users",
    "walk_records"
  ],
  "stale_list": []
}
```

---

**Report Generated**: 2026-03-06  
**Execution Context**: S1 Schema Drift Detection — Dawn Sweep pipeline  
**Source Files**:
- `/frontend/src/types/database.types.ts` (types authority)
- `/frontend/src/lib/hooks/*.ts` (runtime usage)
- `/docs/ref/SCHEMA-CHANGELOG.md` (documentation authority)

---

**S1-FIX Status**: 15개 자동 등록 완료 (2026-03-07)
