---
name: page-chat-list-upgrade
description: Upgrade /chat route UI, data flow, and route-specific behavior for parity work. Use when implementing or stabilizing /chat and its directly related feature modules and hooks.
---

# page-chat-list-upgrade

## Trigger
- Improve or finish /chat
- Resolve parity work for DANG-CHT-001
- Stabilize the route before QA or Done

## Input Context
- Route: /chat
- Page file: frontend/src/app/(main)/chat/page.tsx
- Parity: DANG-CHT-001
- Priority: P0

## Read First
1. docs/status/PAGE-UPGRADE-BOARD.md
2. docs/status/SKILL-DOC-MATRIX.md
3. docs/status/PROJECT-STATUS.md
4. frontend/src/app/(main)/chat/page.tsx

## Related Files
- frontend/src/app/(main)/chat/page.tsx
- frontend/src/lib/hooks/useChat.ts

## Recommended Feature Skills
- feature-data-binding-and-loading
- feature-ui-empty-and-skeleton

## Procedure
1. Confirm the route's current status and parity expectations from board and status docs.
2. Limit edits to the route and the directly related feature modules, hooks, and supporting files.
3. Implement explicit loading, empty, error, and success behavior where relevant.
4. Reuse existing shared components and hooks before adding new abstractions.
5. Keep docs and daily evidence in sync when route behavior or parity status changes.

## Acceptance Focus
- chat room list, unread badge, realtime updates
- Route behavior matches current status docs.
- No mock or hardcoded fallback remains in the production path.

## Validation
- cd frontend && npx tsc --noEmit
- Run the narrowest relevant test or lint path available.
- Verify route behavior manually if no automated check exists.
- Update route docs if status or evidence changed.

## Output
- Scope: DANG-CHT-001
- Files:
- Validation:
- Daily Sync:
- Risks:
- Self-Review:
- Next Recommendations:
