# Schema Drift Analysis Report

**Generated:** 2026-03-07  
**Analysis Scope:** DangApp Supabase database schema consistency  
**Status:** Complete

---

## Executive Summary

This report identifies discrepancies between:
1. **Defined Tables** – Types declared in `database.types.ts`
2. **Used Tables** – Tables referenced in query hooks (`/hooks`)
3. **Documented Tables** – Tables with migration/schema notes in `SCHEMA-CHANGELOG.md`

**Key Finding:** Schema definition is well-maintained (100% type coverage for used tables), but documentation coverage is low at 20%. Three tables are defined but never used, suggesting either deprecated features or planned functionality.

---

## Data Sources

| Source | Path | Count |
|--------|------|-------|
| **Defined** | `frontend/src/types/database.types.ts` | 30 tables |
| **Used in Hooks** | `frontend/src/lib/hooks/**/*.ts` | 27 tables |
| **Documented** | `docs/ref/SCHEMA-CHANGELOG.md` | 6 tables |

---

## Classification Results

### 1. UNUSED Tables (3)
**Definition:** Defined in types but never used in any hook query.  
**Implication:** Likely deprecated, planned for future use, or dead code.

| Table | Status | Notes |
|-------|--------|-------|
| `blocks` | Unused | May be part of user blocking feature not yet implemented |
| `notifications` | Unused | Notification system defined but not hooked; check if using `notification_settings` instead |
| `reports` | Unused | User reporting feature not yet wired; orphaned table |

**Risk:** Orphaned tables consume storage and may cause confusion. Recommend audit and either remove or implement the feature.

---

### 2. UNTYPED Tables (0)
**Definition:** Tables used in hooks but missing type definitions.  
**Status:** CLEAN – All queries have proper TypeScript definitions.

---

### 3. UNDOCUMENTED Tables (26)
**Definition:** Defined in types but have no migration/changelog entry.  
**Implication:** Schema changes are not tracked; difficult to audit migrations or understand design decisions.

| Category | Tables | Count |
|----------|--------|-------|
| **Chat System** | `chat_participants`, `chat_rooms`, `chat_messages` | 3 |
| **DangLog (Collab)** | `danglogs`, `danglog_collaborators`, `danglog_comments`, `danglog_invites`, `danglog_likes` | 5 |
| **Dogs & Matching** | `dogs`, `dog_ownership`, `care_requests`, `matches` | 4 |
| **Family & Groups** | `family_groups`, `family_members` | 2 |
| **Schedules & Walk** | `schedules`, `schedule_participants`, `walk_records`, `walk_reviews` | 4 |
| **Settings & Trust** | `mode_unlocks`, `notification_settings`, `trust_badges`, `guardians`, `users` | 5 |
| **Business (B2B)** | `partner_places`, `reservations` | 2 |
| **Compliance** | `consent_logs` | 1 |

**Action Required:** Document these 26 tables in `SCHEMA-CHANGELOG.md` with:
- Creation date and version
- Column descriptions
- RLS policy summary
- Migration dependencies

---

### 4. STALE Tables (2)
**Definition:** Documented in changelog but not present in type definitions.  
**Implication:** Schema has evolved; documentation is outdated or refers to renamed/merged tables.

| Table | Last Known Reference | Action |
|-------|----------------------|--------|
| `match_guardians_v2` | SCHEMA-CHANGELOG.md | Database view? Check SQL schema. If removed, delete changelog entry. |
| `set_guardian_location` | SCHEMA-CHANGELOG.md | Stored procedure? Check Supabase Functions. Update docs accordingly. |

**Investigation Needed:**
```bash
# Check if these are views or functions in Supabase
psql <DATABASE_URL> -c "SELECT * FROM information_schema.views WHERE table_name LIKE 'match_guardians%';"
psql <DATABASE_URL> -c "SELECT * FROM information_schema.routines WHERE routine_name = 'set_guardian_location';"
```

---

## Summary Metrics

```json
{
  "unused": 3,
  "untyped": 0,
  "undocumented": 26,
  "stale": 2,
  "total_defined": 30,
  "total_used": 27,
  "total_documented": 6,
  "type_coverage_of_used": "100%",
  "documentation_coverage": "20%"
}
```

---

## Health Indicators

| Indicator | Value | Status | Threshold |
|-----------|-------|--------|-----------|
| **Type Coverage** | 100% | ✅ PASS | > 95% |
| **Documentation Coverage** | 20% | ⚠️ WARN | > 80% |
| **Dead Code Ratio** | 10% | ⚠️ WARN | < 5% |
| **Stale References** | 2 | ⚠️ WARN | 0 |

---

## Recommended Actions

### Priority 1: Document Undocumented Tables
- [ ] Add migration entries for all 26 undocumented tables to `SCHEMA-CHANGELOG.md`
- [ ] Include: purpose, columns, RLS rules, dependencies
- **Effort:** 2-3 hours  
- **Impact:** Onboard new team members; enable audit trail

### Priority 2: Resolve Stale References
- [ ] Verify `match_guardians_v2` and `set_guardian_location` in Supabase console
- [ ] If removed: delete changelog entries
- [ ] If active: add to `database.types.ts` and document
- **Effort:** 30 minutes  
- **Impact:** Clear documentation; avoid confusion

### Priority 3: Audit Unused Tables
- [ ] Review `blocks`, `notifications`, `reports` for active features
- [ ] Decision: Keep (planned) or Delete (dead code)
- **Effort:** 1 hour  
- **Impact:** Reduce schema complexity; clarify roadmap

### Priority 4: Link Daily Logs
- [ ] Create or update `docs/daily/MM-DD/schema-drift.md` with findings
- [ ] Track remediation progress in `docs/status/PAGE-UPGRADE-BOARD.md`

---

## Appendix: Full Table Inventory

### Defined Tables (30)
```
blocks
care_requests
chat_messages
chat_participants
chat_rooms
consent_logs
danglog_collaborators
danglog_comments
danglog_invites
danglog_likes
danglogs
dog_ownership
dogs
family_groups
family_members
guardians
matches
mode_unlocks
notification_settings
notifications
partner_places
reports
reservations
reviews
schedule_participants
schedules
trust_badges
users
walk_records
walk_reviews
```

### Used in Hooks (27)
```
care_requests
chat_messages
chat_participants
chat_rooms
consent_logs
danglog_collaborators
danglog_comments
danglog_invites
danglog_likes
danglogs
dog_ownership
dogs
family_groups
family_members
guardians
matches
mode_unlocks
notification_settings
partner_places
reservations
reviews
schedule_participants
schedules
trust_badges
users
walk_records
walk_reviews
```

### Documented (6)
```
chat_messages
matches
match_guardians_v2 [STALE]
reviews
set_guardian_location [STALE]
walk_records
```

---

## Next Steps

1. **Immediate:** Run Priority 1 & 2 actions above
2. **Weekly:** Add schema drift check to preflight checklist
3. **Monthly:** Re-run this analysis and update the report
4. **Ongoing:** Document new tables at creation time, not retroactively

---

**Report Author:** Schema Drift Analyzer  
**Report Version:** 1.0  
**Next Review Date:** 2026-03-14
