# 30 Failure Modes

## MCP access failure
- Recheck access token and MCP config.
- Confirm the project ref is correct.
- Stop before improvising database changes another way.

## Migration failure
- Read the migration error first.
- Check for drift between local migration state and remote state.
- Repair migration state only after confirming the exact mismatch.

## RLS or permission failure
- Confirm whether the issue is service-role execution vs authenticated runtime behavior.
- Validate policies with the correct actor assumptions.
- Avoid broad policy relaxation as a shortcut.

## Data fix risk
- Prefer idempotent updates.
- Scope updates narrowly by primary key or deterministic filter.
- Verify affected rows before and after the change.
