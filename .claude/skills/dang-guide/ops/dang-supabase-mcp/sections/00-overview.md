# 00 Overview

## Purpose
Use Supabase MCP for schema inspection, SQL execution, migrations, and verification when repo work touches database behavior.

## Prerequisites
- `SUPABASE_ACCESS_TOKEN` is configured.
- Repo MCP config is present.
- You know whether the task is read-only, data-fix, or schema-change work.

## Allowed Work
- Inspect tables, logs, extensions, and policies.
- Execute safe read queries.
- Apply migrations intentionally.
- Verify post-change behavior with explicit checks.

## Default Rule
Start with read-only inspection before any write or migration action.
