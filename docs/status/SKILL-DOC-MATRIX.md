# Skill Doc Matrix

| page_skill | target_route | primary_code_paths | required_docs | feature_skills | acceptance_checks |
|---|---|---|---|---|---|
| `page-login-upgrade` | `/login` | `frontend/src/app/(auth)/login/page.tsx` | `docs/status/PROJECT-STATUS.md` | `feature-form-validation-and-submit`, `feature-error-and-retry-state` | magic link send, consent logging, dev redirect removal |
| `page-register-upgrade` | `/register` | `frontend/src/app/(auth)/register/page.tsx` | `docs/status/PROJECT-STATUS.md` | `feature-form-validation-and-submit` | OTP gate, required consent checks, redirect to `/onboarding` |
| `page-onboarding-upgrade` | `/onboarding` | `frontend/src/app/(auth)/onboarding/page.tsx`, `frontend/src/components/features/onboarding/*`, `frontend/src/stores/useOnboardingStore.ts`, `frontend/src/lib/hooks/useOnboarding.ts` | `docs/status/PROJECT-STATUS.md`, `docs/status/MISSING-AND-UNIMPLEMENTED.md` | `feature-form-validation-and-submit`, `feature-navigation-and-gesture` | minimum field progress, full completion state, photo upload, consent logging |
| `page-home-upgrade` | `/home` | `frontend/src/app/(main)/home/page.tsx`, `frontend/src/components/features/match/*`, `frontend/src/lib/hooks/useMatch.ts` | `docs/status/PROJECT-STATUS.md`, `docs/status/11-FEATURE-PARITY-MATRIX.md` | `feature-data-binding-and-loading`, `feature-ui-empty-and-skeleton` | match cards load, like/pass updates matches, empty state coverage |
| `page-chat-list-upgrade` | `/chat` | `frontend/src/app/(main)/chat/page.tsx`, `frontend/src/lib/hooks/useChat.ts` | `docs/status/PROJECT-STATUS.md` | `feature-data-binding-and-loading`, `feature-ui-empty-and-skeleton` | `chat_rooms` list, unread badge, realtime updates |
| `page-chat-room-upgrade` | `/chat/[id]` | `frontend/src/app/(main)/chat/[id]/page.tsx`, `frontend/src/components/features/chat/ScheduleModal.tsx`, `frontend/src/lib/hooks/useChat.ts`, `frontend/src/lib/hooks/useSchedule.ts` | `docs/status/PROJECT-STATUS.md`, `docs/status/MISSING-AND-UNIMPLEMENTED.md` | `feature-navigation-and-gesture`, `feature-error-and-retry-state` | realtime messages, schedule proposal and acceptance persisted, auth guard handling |
| `page-danglog-feed-upgrade` | `/danglog` | `frontend/src/app/(main)/danglog/page.tsx`, `frontend/src/components/features/danglog/*`, `frontend/src/lib/hooks/useDangLog.ts` | `docs/status/PROJECT-STATUS.md` | `feature-data-binding-and-loading`, `feature-form-validation-and-submit` | likes and comments CRUD, collaboration invite flow, sharing paths |
| `page-profile-upgrade` | `/profile` | `frontend/src/app/(main)/profile/page.tsx`, `frontend/src/components/features/profile/*`, `frontend/src/lib/hooks/useProfile.ts` | `docs/status/PROJECT-STATUS.md` | `feature-data-binding-and-loading`, `feature-form-validation-and-submit` | guardian and dog profile editing, notification settings, trust score and incomplete-profile banner |
| `page-modes-upgrade` | `/modes` | `frontend/src/app/(main)/modes/page.tsx`, `frontend/src/stores/useModeStore.ts`, `frontend/src/lib/hooks/useMode.ts` | `docs/status/PROJECT-STATUS.md` | `feature-navigation-and-gesture` | `mode_unlocks` data binding and score-based unlock flow |
| `page-care-upgrade` | `/care` | `frontend/src/app/(main)/care/page.tsx`, `frontend/src/lib/hooks/useCare.ts` | `docs/status/PROJECT-STATUS.md` | `feature-data-binding-and-loading` | `care_requests` CRUD, type filter, request/accept selection flow |
| `page-family-upgrade` | `/family` | `frontend/src/app/(main)/family/page.tsx`, `frontend/src/lib/hooks/useFamily.ts` | `docs/status/PROJECT-STATUS.md` | `feature-data-binding-and-loading` | `family_groups` CRUD and member management |

## Ops Skills

| ops_skill | purpose | sections | related_parity |
|---|---|---|---|
| `dang-route-doc-parity` | Keep App Router routes and the route board aligned before status sync work. | `Purpose`, `Structure`, `Responsibilities` | All route parity work |
| `dang-supabase-mcp` | Run Supabase MCP work with a stable preflight, failure-mode, and QA checklist. | `00-overview`, `20-runbook`, `30-failure-modes`, `40-qa-checklist` | `DANG-INFRA-001` |
| `dang-rpc-diagnosis` | Diagnose empty or erroring RPC/query flows and map fixes back to runtime behavior. | `00-overview`, `10-diagnosis-runbook`, `20-fix-patterns`, `30-verification` | `DANG-MAT-001`, `DANG-CHT-001` |
| `subagent-doc-check` | Split consistency checks into code facts, docs facts, and rule-chain facts before comparing drift. | `Trigger`, `Read First`, `Procedure`, `Validation`, `Output` | Repo-wide docs/status integrity |
| `subagent-pattern-collect` | Gather route, feature, or data-contract implementation patterns before building. | `Trigger`, `Read First`, `Procedure`, `Validation`, `Output` | Repo-wide implementation planning |
