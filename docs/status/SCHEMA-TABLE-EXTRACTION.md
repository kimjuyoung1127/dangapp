# Schema Drift Analysis: Table Extraction Report
**Generated:** 2026-03-07 17:00 UTC  
**Status:** Automated extraction for schema consistency validation  
**Scope:** Compare defined tables, used tables, and documented tables

---

## Executive Summary

- **Total Tables Defined in database.types.ts:** 30 (+ 2 RPC functions)
- **Confirmed Used in Hooks:** 27 via .from() calls
- **Undefined but Used:** 0 (no drift detected)
- **Defined but Unused:** 2 (blocks, notifications)
- **Documentation Sync:** 10 tables auto-documented in SCHEMA-CHANGELOG.md as of 2026-03-07
- **Overall Drift Risk:** LOW (all used tables are defined; only 2 unused defined tables)

---

## 1. Complete Table List from database.types.ts
**File:** `/sessions/nice-youthful-planck/mnt/dangapp/frontend/src/types/database.types.ts` (1049 lines)  
**Structure:** TypeScript Database interface with public schema containing 33 named items (30 tables + 2 RPC functions + 1 schema wrapper)

### All 30 Core Tables:
| # | Table Name | Row Type | Status |
|---|---|---|---|
| 1 | users | Row, Insert, Update | Defined |
| 2 | guardians | Row, Insert, Update | Defined |
| 3 | dogs | Row, Insert, Update | Defined |
| 4 | matches | Row, Insert, Update | Defined |
| 5 | blocks | Row, Insert, Update | Defined |
| 6 | chat_rooms | Row, Insert, Update | Defined |
| 7 | chat_participants | Row, Insert, Update | Defined |
| 8 | chat_messages | Row, Insert, Update | Defined |
| 9 | schedules | Row, Insert, Update | Defined |
| 10 | danglogs | Row, Insert, Update | Defined |
| 11 | danglog_comments | Row, Insert, Update | Defined |
| 12 | danglog_likes | Row, Insert, Update | Defined |
| 13 | reviews | Row, Insert, Update | Defined |
| 14 | trust_badges | Row, Insert, Update | Defined |
| 15 | notifications | Row, Insert, Update | Defined |
| 16 | walk_records | Row, Insert, Update | Defined |
| 17 | walk_reviews | Row, Insert, Update | Defined |
| 18 | danglog_collaborators | Row, Insert, Update | Defined |
| 19 | danglog_invites | Row, Insert, Update | Defined |
| 20 | notification_settings | Row, Insert, Update | Defined |
| 21 | consent_logs | Row, Insert, Update | Defined |
| 22 | care_requests | Row, Insert, Update | Defined |
| 23 | family_groups | Row, Insert, Update | Defined |
| 24 | family_members | Row, Insert, Update | Defined |
| 25 | mode_unlocks | Row, Insert, Update | Defined |
| 26 | partner_places | Row, Insert, Update | Defined |
| 27 | reservations | Row, Insert, Update | Defined |
| 28 | reports | Row, Insert, Update | Defined |
| 29 | dog_ownership | Row, Insert, Update | Defined |
| 30 | schedule_participants | Row, Insert, Update | Defined |

### 2 RPC Functions (in Database interface):
- `create_chat_room_with_participants`
- `set_guardian_location`

---

## 2. Tables Actually Used in Hooks
**Hook Files Analyzed:** 18 files (17 functional + 1 test in hooks directory)  
**Query Method:** Extracted all `.from()` and `.storage.from()` calls  
**Total .from() Calls:** 102 across all hooks  
**Unique Tables:** 27 via `.from()`

### All 27 Used Tables (✓ confirmed usage):
1. ✓ care_requests (useCare.ts)
2. ✓ chat_messages (useChat.ts)
3. ✓ chat_participants (useChat.ts)
4. ✓ chat_rooms (useChat.ts)
5. ✓ consent_logs (useOnboarding.ts)
6. ✓ danglog_collaborators (useDangLog.ts)
7. ✓ danglog_comments (useDangLog.ts)
8. ✓ danglog_invites (useDangLog.ts)
9. ✓ danglog_likes (useDangLog.ts)
10. ✓ danglogs (useDangLog.ts)
11. ✓ dog_ownership (useProfile.ts)
12. ✓ dogs (useMatch.ts, useProfile.ts, useFamily.ts)
13. ✓ family_groups (useFamily.ts)
14. ✓ family_members (useFamily.ts)
15. ✓ guardians (useMatch.ts, useProfile.ts, useOnboarding.ts)
16. ✓ matches (useMatch.ts)
17. ✓ mode_unlocks (useMode.ts)
18. ✓ notification_settings (useProfile.ts)
19. ✓ partner_places (useMatch.ts, useMode.ts)
20. ✓ reservations (useCare.ts)
21. ✓ reviews (useReview.ts)
22. ✓ schedule_participants (useSchedule.ts)
23. ✓ schedules (useSchedule.ts)
24. ✓ trust_badges (useProfile.ts)
25. ✓ users (useCurrentGuardian.ts, useOnboarding.ts)
26. ✓ walk_records (useWalkRecord.ts)
27. ✓ walk_reviews (useWalkReview.ts)

### Storage Buckets (via .storage.from()):
- `dog-profiles` (useDangLog.ts, useProfile.ts)
- `danglog-images` (useDangLog.ts)
- `walk-records` (useWalkRecord.ts)

---

## 3. Defined but NOT Used in Hooks

### Two Tables with No .from() References:
1. **blocks** - Defined in database.types.ts but no direct .from("blocks") calls
   - May be accessed via RPC
   - May be write-only (insert but no read queries)
   - May be accessed through relationship queries

2. **notifications** - Defined in database.types.ts but no direct .from("notifications") calls
   - May be accessed via RPC or triggers
   - May be written by backend/triggers only
   - May be legacy table

**Action Required:** Verify actual usage via:
- RPC function parameters
- Trigger definitions
- Backend write operations
- Foreign key relationships

---

## 4. Auto-Documented Tables (SCHEMA-CHANGELOG.md)

**Latest Documentation Cycle:** 2026-03-07 Dawn Sweep S1  
**Location:** `/sessions/nice-youthful-planck/mnt/dangapp/docs/ref/SCHEMA-CHANGELOG.md`

### Auto-Documented Entries:
1. **consent_logs** - Auth consent tracking (used: ✓)
2. **danglog_collaborators** - Co-author mapping (used: ✓)
3. **danglogs** - Walk/activity log entries (used: ✓)
4. **dog_ownership** - Dog-guardian N:M relationship (used: ✓)
5. **dogs** - Dog profile core table (used: ✓)
6. **guardians** - Guardian/user profile enrichment (used: ✓)
7. **matches** - Matching result snapshots (used: ✓)
8. **notification_settings** - User notification preferences (used: ✓)
9. **partner_places** - B2B location registry (used: ✓)
10. **reports** - Report records (used: ?)

**Missing Auto-Documentation:**
- blocks (defined but unused)
- notifications (defined but unused)
- care_requests, chat_*, schedules, family_*, reviews, walk_*, etc.
- RPC functions not documented

---

## 5. Schema Drift Assessment

### ✓ PASSING CHECKS:
- No undefined tables used in hooks
- All .from() calls map to defined types
- No naming mismatches between types and queries
- Core schema integrity maintained

### ⚠ WARNINGS:
1. **Two Orphaned Table Definitions:** blocks and notifications
   - Impact: Code bloat, potential dead code
   - Risk: Low (defined types don't break functionality)
   - Remedy: Document usage or remove

2. **Storage Bucket Naming Inconsistency:**
   - DB tables use snake_case (walk_records)
   - Storage buckets use kebab-case (walk-records)
   - Runtime risk: Low if buckets are hard-coded
   - Best practice: Standardize naming convention

3. **Partial Documentation:**
   - Only 10 of 30 tables have SCHEMA-CHANGELOG.md entries
   - Others lack audit trail
   - Remedy: Run full auto-documentation cycle

### ✗ FAILURES:
None detected in core usage patterns.

---

## 6. Hook Usage Distribution

### Hook Files by Query Count:
| Hook File | .from() Count | Primary Tables |
|---|---|---|
| useDangLog.ts | 19 | danglogs, danglog_* |
| useChat.ts | 17 | chat_*, schedules |
| useMode.ts | 15 | partner_places, mode_unlocks |
| useSchedule.ts | 7 | schedules, schedule_participants |
| useMatch.ts | 6 | matches, guardians, dogs, partner_places |
| useFamily.ts | 5 | family_groups, family_members, dogs |
| useProfile.ts | 11 | guardians, dogs, reviews, trust_badges |
| useOnboarding.ts | 8 | guardians, users, consent_logs |
| useMode.ts | 15 | mode_unlocks, partner_places |
| useCare.ts | 3 | care_requests, reservations |
| useWalkRecord.ts | 5 | walk_records, dogs |
| useReview.ts | 3 | reviews |
| useWalkReview.ts | 2 | walk_reviews |
| useCurrentGuardian.ts | 1 | users |
| useDebugDemoFallback.ts | 0 | N/A |

**Heaviest Tables (by hook references):**
1. guardians (4 hooks)
2. dogs (5 hooks)
3. danglogs (1 hook, 19 calls)
4. schedules (2 hooks)
5. partner_places (2 hooks)

---

## 7. Recommended Actions (Priority Order)

### IMMEDIATE (Blocking):
1. **Verify blocks table usage:**
   ```bash
   grep -r "blocks" /sessions/nice-youthful-planck/mnt/dangapp --include="*.ts" --include="*.sql"
   ```
   - If unused: Remove from database.types.ts with deprecation note
   - If used: Document in SCHEMA-CHANGELOG.md with usage pattern

2. **Verify notifications table usage:**
   ```bash
   grep -r "notifications" /sessions/nice-youthful-planck/mnt/dangapp --include="*.ts" --include="*.sql"
   ```
   - If unused: Remove or mark as deprecated
   - If write-only: Document RPC/trigger access pattern

### HIGH (1-2 days):
3. **Complete auto-documentation:**
   - Add blocks and notifications to SCHEMA-CHANGELOG.md
   - Document all RPC functions
   - Link each table to owning feature (DANG-CHT, DANG-MAT, etc.)

4. **Standardize storage bucket naming:**
   - Decide: kebab-case or snake_case convention
   - Update all .storage.from() calls to match
   - Document in `docs/ref/CODING-STANDARDS.md`

5. **Generate schema drift report:**
   - Run automated schema validation in docs/status/
   - Update .schema-drift.lock with latest findings
   - Cross-check against PAGE-UPGRADE-BOARD.md

### MEDIUM (end-of-week):
6. **Document RPC functions:**
   - create_chat_room_with_participants: Parameters, return type
   - set_guardian_location: Parameters, return type
   - Add to SCHEMA-CHANGELOG.md with parity ID

7. **Audit foreign keys:**
   - Verify referential integrity
   - Document N:M relationships (e.g., dog_ownership)
   - Update ER diagram if available

---

## 8. Files Modified/Involved

### Core Files:
- `/sessions/nice-youthful-planck/mnt/dangapp/frontend/src/types/database.types.ts` (1049 lines)
- `/sessions/nice-youthful-planck/mnt/dangapp/docs/ref/SCHEMA-CHANGELOG.md` (15636 bytes)
- `/sessions/nice-youthful-planck/mnt/dangapp/frontend/src/lib/hooks/*.ts` (18 files)

### Status Files:
- `/sessions/nice-youthful-planck/mnt/dangapp/docs/status/PROJECT-STATUS.md`
- `/sessions/nice-youthful-planck/mnt/dangapp/docs/status/PAGE-UPGRADE-BOARD.md`
- `/sessions/nice-youthful-planck/mnt/dangapp/docs/status/.schema-drift.lock`

---

## 9. Validation Checklist

- [x] Extract table names from database.types.ts
- [x] Extract .from() calls from all hooks
- [x] Cross-reference defined vs used tables
- [x] Check for orphaned definitions
- [x] Verify storage bucket naming
- [x] Scan SCHEMA-CHANGELOG.md for coverage
- [ ] Verify blocks and notifications usage (NEXT)
- [ ] Audit RPC function schemas
- [ ] Validate foreign key relationships
- [ ] Update documentation with findings
- [ ] Sync with PAGE-UPGRADE-BOARD.md

---

## 10. Appendix: Quick Reference

### All Tables by Parity Feature:
- **DANG-CHT-001 (Chat):** chat_rooms, chat_participants, chat_messages, schedules
- **DANG-MAT-001 (Matching):** matches, guardians, dogs, blocks(?), partner_places
- **DANG-DLG-001 (DangLog):** danglogs, danglog_comments, danglog_likes, danglog_collaborators, danglog_invites
- **DANG-WLK-001 (Walk):** walk_records, walk_reviews, schedules, dogs
- **DANG-ONB-001 (Onboarding):** guardians, users, consent_logs, mode_unlocks
- **DANG-FAM-001 (Family):** family_groups, family_members, dogs
- **DANG-CARE-001:** care_requests, reservations
- **DANG-PROFILE-001:** guardians, dogs, reviews, trust_badges, notification_settings
- **Uncategorized:** reports, notifications, dog_ownership, schedule_participants

---

**End of Report**  
Report generated for schema validation and drift closure task.
