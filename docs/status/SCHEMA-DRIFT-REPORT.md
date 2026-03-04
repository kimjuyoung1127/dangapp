# Schema Drift Report

**Generated**: 2026-03-03T17:02:XX KST  
**Run**: Dawn Sweep — STEP 1

---

## Summary

| Category | Count | Severity |
|----------|-------|----------|
| UNTYPED_TABLES (hooks use, not in types) | 0 | ✅ Clear |
| UNUSED_TABLES (types exist, hooks don't use) | 2 | ℹ️ Info |
| UNDOCUMENTED_TABLES (types not in changelog) | 15 | ⚠️ Warning |
| STALE_CHANGELOG (changelog not in types) | 0 | ✅ Clear |

---

## UNTYPED_TABLES — Critical ✅ None

No tables used in hooks without type definitions.

---

## UNUSED_TABLES — Info (2)

Tables defined in `database.types.ts` but not referenced in any hook:

- `blocks`
- `notifications`

> Note: These tables may be used in page components or future features. Not necessarily a problem.

---

## UNDOCUMENTED_TABLES — Warning (15)

Tables in `database.types.ts` not mentioned in `docs/ref/SCHEMA-CHANGELOG.md`:

- `blocks`
- `care_requests`
- `chat_messages`
- `chat_participants`
- `chat_rooms`
- `danglog_comments`
- `danglog_invites`
- `danglog_likes`
- `family_groups`
- `family_members`
- `mode_unlocks`
- `notifications`
- `schedules`
- `trust_badges`
- `walk_reviews`

> SCHEMA-CHANGELOG.md is a summary document — these tables may be covered implicitly. Recommend expanding changelog entries per table.

---

## STALE_CHANGELOG — ✅ None

All changelog entries have corresponding type definitions.

---

## Type Coverage

| Metric | Count |
|--------|-------|
| Total tables in types | 25 |
| Tables used in hooks | 23 |
| Hook coverage | 92% |

---

## Sources

- `frontend/src/types/database.types.ts` — 25 tables
- `docs/ref/SCHEMA-CHANGELOG.md` — 10 table references
- `frontend/src/lib/hooks/*.ts` — 11 files, 23 unique tables

