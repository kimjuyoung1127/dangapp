# Schema Drift Report — 2026-03-02

**Report Generated**: 2026-03-02T17:10:30Z (Execution Round 2)
**DRY_RUN**: false
**Sources**: `database.types.ts` ↔ `supabase/migrations/*.sql` ↔ `frontend/src/lib/hooks/**/*.ts`

---

## Summary

| Check | Count | Severity |
|-------|-------|----------|
| Unused tables (types only) | 2 | Info |
| Untyped tables (hooks only) | 2 | **Critical** ⚠️ |
| Undocumented tables (types, not in changelog) | 3 | Warning |
| Stale changelog entries | 0 | ✅ Clear |
| Missing columns | 0 | ✅ Clear |

**Overall Health**: 🟡 **2 Critical issues** (storage buckets used as Postgres tables), 3 warning items. No blocking issues.

---

## 🔴 Critical: Untyped Tables

Tables referenced in hooks but NOT in `database.types.ts`. **Investigate for potential runtime errors.**

| Table | Used In | Finding |
|-------|---------|---------|
| `danglog-images` | useDangLog.ts | Storage bucket (Supabase Storage), not Postgres table. Used as `supabase.storage.from("danglog-images")`. ✅ **Correct usage.** |
| `dog-profiles` | useOnboarding.ts | Storage bucket (Supabase Storage), not Postgres table. Used as `supabase.storage.from("dog-profiles")`. ✅ **Correct usage.** |

**Explanation**: These are NOT database tables, so they should not appear in `database.types.ts`. The hooks correctly reference them via Supabase Storage API. **No action required.**

---

## ⚠️ Warning: Undocumented Tables

Tables in Types and migrations but NOT explicitly listed in SCHEMA-CHANGELOG.md.

| Table | Migration File | Changelog Status |
|-------|----------------|------------------|
| `care_requests` | `20260228120000_create_care_family_tables.sql` | ❌ Not mentioned in 2026-03-02 entry |
| `family_groups` | `20260228120000_create_care_family_tables.sql` | ❌ Not mentioned in 2026-03-02 entry |
| `family_members` | `20260228120000_create_care_family_tables.sql` | ❌ Not mentioned in 2026-03-02 entry |

**Status**: Migrations exist and tables are properly typed. The SCHEMA-CHANGELOG.md entry (2026-03-02) mentions "onboarding, matching request metadata, walk records/reviews, collaborative danglog, notification settings, and consent logs" but omits the care/family tables.

**Recommendation**: Update SCHEMA-CHANGELOG.md entry to explicitly list all new tables added in Wave 1.

---

## ℹ️ Info: Unused Tables

Tables defined in Types and migrations but NOT yet used by any hook.

| Table | Defined | Used | Note |
|-------|---------|------|------|
| `blocks` | 20260228000000_initial_schema.sql | ❌ No `.from("blocks")` in hooks | User-blocking feature, likely DANG-MAT-001 phase 2 |
| `notifications` | 20260228000000_initial_schema.sql | ❌ No `.from("notifications")` in hooks | Notification delivery, likely V2 feature |

**Status**: Expected for unimplemented features. Not errors.

---

## ✅ Info: Stale Changelog

No stale entries. All tables in migrations are reflected in `database.types.ts`.

---

## ✅ Column-Level Drift

No missing columns. All specific `.select()` references in hooks match columns in database.types.ts.

---

## Data Coverage

| Source | Count | Details |
|--------|-------|---------|
| `database.types.ts` Tables | 25 | blocks, care_requests, chat_messages, chat_participants, chat_rooms, consent_logs, danglog_collaborators, danglog_comments, danglog_invites, danglog_likes, danglogs, dogs, family_groups, family_members, guardians, matches, mode_unlocks, notification_settings, notifications, reviews, schedules, trust_badges, users, walk_records, walk_reviews |
| Migrations (authoritative) | 23 | Same as Types (notifications and 1 other not in migration SQL) |
| Hook References | 25 | Includes 2 storage buckets (danglog-images, dog-profiles) |

### Hooks scanned (11 files)
useChat.ts, useCurrentGuardian.ts, useDangLog.ts, useMatch.ts, useMode.ts, useOnboarding.ts, useProfile.ts, useReview.ts, useSchedule.ts, useWalkRecord.ts, useWalkReview.ts

### Migrations scanned (7 files)
20260228000000_initial_schema.sql, 20260228000001_matching_rpc.sql, 20260228065650_create_danglogs_bucket.sql, 20260228120000_create_care_family_tables.sql, 20260302090000_wave1_schema_foundation.sql, 20260302090500_core_rls_baseline.sql, 20260302091000_wave1_storage_policies.sql

---

## Recommendations (Priority Order)

1. **[LOW] Update SCHEMA-CHANGELOG.md** (docs/ref/SCHEMA-CHANGELOG.md)
   - Add explicit mention of `care_requests`, `family_groups`, `family_members` in Wave 1 entry.
   - Current entry reads: "...onboarding, matching request metadata, walk records/reviews, collaborative danglog, notification settings, and consent logs."
   - Should include: "...care request tables (care_requests, family_groups, family_members)..."

2. **[INFO] Future Hooks**
   - `blocks` table → Consider `useBlock.ts` when user-blocking feature (DANG-MAT-001) is started.
   - `notifications` table → Consider `useNotification.ts` when notification delivery (V2) is started.

---

**Next Scan**: 2026-03-03 02:00 UTC (scheduled automation)
