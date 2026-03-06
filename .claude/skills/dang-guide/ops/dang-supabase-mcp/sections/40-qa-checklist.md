# 40 QA Checklist

## After read-only inspection
- Query results are captured or summarized.
- Relevant docs to update are identified.

## After data changes
- Affected rows were verified before and after the change.
- No unrelated rows were touched.
- Runtime behavior was rechecked from the app or hook path.

## After schema changes
- Migration applied cleanly.
- Generated types or schema docs are considered if they depend on the change.
- RLS, indexes, and dependent queries were rechecked.

## Documentation
- Status docs and changelog notes reflect the change when needed.
- Remaining risks are written down explicitly.
