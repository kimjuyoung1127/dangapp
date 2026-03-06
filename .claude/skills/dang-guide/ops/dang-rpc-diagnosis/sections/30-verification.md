# 30 Verification

## Checklist
- The failing RPC or query now returns the expected rows or shape.
- The frontend route or hook uses the same params that were validated during diagnosis.
- Any temporary debug artifacts are removed or clearly isolated.
- Status docs are updated if the fix changes parity or unblock state.

## Evidence
- Record the exact query or runtime path that was fixed.
- Record whether the issue was RLS, data quality, contract mismatch, or client logic.
- Record any remaining risk if reproduction still depends on seeded data or special auth context.
