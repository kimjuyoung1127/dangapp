# DangApp Master Execution Plan

Date: 2026-03-02
Scope: Full-scope requirements with workflow alignment first.

## 1. Execution Policy

1. Workflow alignment (docs/parity/route board/skill matrix) is mandatory before feature implementation.
2. Every task must map to parity IDs.
3. Route-level execution model: one page skill + up to two feature skills.
4. Daily sync and board sync are required at task end.

## 2. Parity IDs

- DANG-INFRA-001
- DANG-DES-001
- DANG-AUTH-001
- DANG-ONB-001
- DANG-MAT-001
- DANG-CHT-001
- DANG-WLK-001
- DANG-DLG-001
- DANG-PRF-001
- DANG-B2B-001

## 3. Wave Plan

### Wave 0 (workflow alignment)
- Initialize control docs and route board.
- Lock completion format and operating rules.

### Wave 1 (schema first)
- Create migration for new fields/tables/enums and base RLS.
- Create storage buckets and object policies.
- Validate migration syntax and references.

### Wave 2 (onboarding)
- Rebuild guardian/dog onboarding with progressive completion gates.

### Wave 3 (home matching)
- Implement matching filters and friend request purpose flow.

### Wave 4 (chat + walk)
- Complete realtime chat schedule confirmation and walk record/review flow.

### Wave 5 (danglog + profile)
- Add collaborative danglog and notification/profile settings.

### Wave 6 (b2b partner)
- Add partner-place recommendations and operator hooks.

## 4. Schema/API Surface Targets

- Extend `guardians`, `dogs`, `matches`, `schedules`.
- Add `walk_records`, `walk_reviews`, `danglog_collaborators`, `danglog_invites`, `notification_settings`, `consent_logs`.
- Add visibility and relation-purpose enums.
- Storage buckets: `dog-profiles`, `dog-documents`, `walk-records`, `danglog-images`.

## 5. Acceptance Criteria

1. All required user fields are persistable and queryable.
2. Filters work for distance/time/mode.
3. Chat schedule proposal/confirm flow persists status.
4. Walk record and review are linked to schedules.
5. Danglog collaboration and invites are permission-protected.
6. RLS blocks unauthorized read/write access.

## 6. Risks

1. Existing core-table RLS gaps may affect legacy hooks.
2. Dirty working tree requires careful non-destructive edits.
3. Missing Supabase PAT at runtime blocks MCP runtime verification.
