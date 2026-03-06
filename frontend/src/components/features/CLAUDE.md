# features/

Shared guidance for `frontend/src/components/features/*`.

- Treat each feature folder as the UI surface for a single product capability.
- Before creating a new feature folder or expanding a feature substantially, run `subagent-pattern-collect` in `feature-module` or `route-page` mode.
- Keep data access in hooks or supporting libs, not inside view components.
- Match feature work to route docs and parity IDs when the feature changes route behavior.
