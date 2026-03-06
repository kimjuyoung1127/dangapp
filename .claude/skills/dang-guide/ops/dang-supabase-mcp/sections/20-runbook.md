# 20 Runbook

## Step 1 - Preflight
1. Confirm task scope and parity ID if applicable.
2. Read the relevant status and schema docs.
3. List current tables, migrations, or logs before changing anything.

## Step 2 - Execute the smallest necessary action
- For inspection: query only the needed tables or logs.
- For data fixes: run the narrowest SQL that fixes the issue.
- For schema changes: use migrations, not ad-hoc DDL.

## Step 3 - Verify immediately
1. Re-run the read query or functional check.
2. Confirm the frontend or route expectation now matches database reality.
3. Capture any follow-up docs that need updating.

## Step 4 - Document
- Record schema or behavior changes in the relevant status docs.
- Note any manual seed or backfill work that future sessions must know.
