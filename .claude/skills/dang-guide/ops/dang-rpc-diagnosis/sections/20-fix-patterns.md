# 20 Fix Patterns

## RLS and auth issues
- Verify authenticated user mapping before changing policies.
- Confirm the route uses the expected guardian or user identifier.
- Fix policies only after reproducing the block with the same auth context.

## Filter and join issues
- Check location, visibility, deleted flags, and ownership filters.
- Check left join vs inner join expectations.
- Verify whether optional related rows are incorrectly treated as required.

## Seed and shape issues
- Backfill missing seed rows when runtime behavior depends on them.
- Align frontend types with the actual RPC or select shape.
- Remove hardcoded fallback assumptions after the backend path is fixed.

## Debug cleanup
- Remove temporary debug queries or debug RPCs once the issue is confirmed.
- Document the root cause in route status or daily notes if it affects parity work.
