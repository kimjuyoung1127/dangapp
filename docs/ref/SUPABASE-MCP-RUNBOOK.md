# Supabase MCP Runbook

## Prerequisites
1. Set `SUPABASE_ACCESS_TOKEN` in shell environment.
2. Ensure `.mcp.json` is present at repo root.

## Codex CLI setup (URL mode)
1. `codex mcp add supabase --url "https://mcp.supabase.com/mcp?project_ref=fjpvtivpulreulfxmxfe" --bearer-token-env-var SUPABASE_ACCESS_TOKEN`
2. `codex mcp list`

## Standard procedure
1. Preflight: project URL/keys/migrations/functions.
2. Apply: migrations and deploy changes.
3. Verify: smoke call + logs.
4. Record: status + request IDs in docs/status and docs/daily.

## Notes
- Do not hardcode access tokens in repo files.
- Prefer PAT-based auth over raw DB password workflows.
