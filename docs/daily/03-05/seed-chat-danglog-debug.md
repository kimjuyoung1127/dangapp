# 03-05 Chat/DangLog Debug Seed Setup

## Scope
- Added debug seed workflow for `/chat`, `/chat/[id]`, `/danglog`.
- No app route/API/type changes.
- No DB schema migration.

## Added Scripts
- `npm run seed:debug`
  - Seeds medium scenario:
    - 2 direct chat rooms
    - about 20 messages (text/image/schedule/system)
    - 10 danglogs with comments/likes
  - Adds `SEEDDBG` tag in content/title.
  - Writes manifest to `output/seed/seed-manifest.json`.
  - Pre-runs TTL cleanup for old seed data (>7 days).
- `npm run seed:check`
  - Read-only checks for table counts + tagged sample rows + manifest summary.
- `npm run seed:cleanup`
  - Deletes seeded rows using manifest IDs and removes manifest.

## Security Hardening
- Rewrote `scripts/seed-scenarios.mjs` to remove hardcoded Supabase URL/service key.
- All seed scripts now use environment variables only.

## Environment
- Added root `.env.example` with:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SEED_PRIMARY_GUARDIAN_ID`
  - `SEED_PARTNER_GUARDIAN_IDS`
  - `SEED_SCENARIO_PRIMARY_GUARDIAN_ID` (optional)

## Validation
- `npm run check:encoding` -> PASS
- `npm run lint` -> PASS
- Root `.env.local` configured (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, seed guardian IDs)
- `npm run seed:debug` -> PASS
  - runId: `1772689293060`
  - result: `rooms=2`, `messages=20`, `danglogs=10`, `comments=15`, `likes=26`
- `npm run seed:check` -> PASS
  - verified totals: `chat_rooms=2`, `chat_messages=20`, `danglogs=10`, `danglog_comments=15`, `danglog_likes=26`
  - manifest detected at `output/seed/seed-manifest.json`
- Fanout seed for all existing guardians (debug expansion) -> PASS
  - latest runId: `1772689635019`
  - verified totals after fanout: `chat_rooms=12`, `chat_messages=120`, `danglogs=60`, `danglog_comments=90`, `danglog_likes=156`

## Runtime Observation
- DangLog feed shows seeded posts in app runtime.
- Chat list can still appear empty for some sessions despite seeded data.
  - Added explicit chat error-state UI so fetch-failure is not masked as empty state:
    - file: `frontend/src/app/(main)/chat/page.tsx`
  - Current handoff focus: verify logged-in user -> guardian mapping in session context and re-check `/chat` rendering path.
