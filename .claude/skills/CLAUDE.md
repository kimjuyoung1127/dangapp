# .claude/skills/

DangApp skill inventory for page, feature, and ops workflows.

## Skill Tiers
- Page skills:
  - `page-login-upgrade`
  - `page-register-upgrade`
  - `page-onboarding-upgrade`
  - `page-home-upgrade`
  - `page-chat-list-upgrade`
  - `page-chat-room-upgrade`
  - `page-danglog-feed-upgrade`
  - `page-profile-upgrade`
  - `page-modes-upgrade`
  - `page-care-upgrade`
  - `page-family-upgrade`
- Feature skills:
  - `feature-data-binding-and-loading`
  - `feature-error-and-retry-state`
  - `feature-form-validation-and-submit`
  - `feature-navigation-and-gesture`
  - `feature-ui-empty-and-skeleton`
- Ops skills:
  - `dang-route-doc-parity`
  - `dang-rpc-diagnosis`
  - `dang-supabase-mcp`
  - `subagent-doc-check`
  - `subagent-pattern-collect`
  - `dang-ui-redesign-orchestrator`

## Rules
- Every skill must include concise trigger and validation guidance.
- Route implementation tasks should load one page skill and at most two feature skills.
- Ops skills should be used for drift detection, diagnostics, or repo-wide pattern collection.
- Subagent skills are for exploration and comparison workflows, not direct code mutation by delegation.
- Use `dang-ui-redesign-orchestrator` before multi-route UI redesign, design-system refresh, or research-driven visual planning.
