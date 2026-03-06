# automations/

DangApp automation prompt index for deterministic documentation and status maintenance.

## Principles
- Keep every automation deterministic and idempotent.
- State the exact source-of-truth files before comparing or reporting.
- Use lock files to avoid duplicate runs.
- Do not edit `frontend/src/` from automation prompts unless a prompt explicitly says so.
- Default to `DRY_RUN=true` and require deliberate promotion to write mode.

## Prompt Files
| File | Purpose | Schedule |
|---|---|---|
| `schema-drift-detector.prompt.md` | Compare schema artifacts and changelog coverage. | Daily 02:00 KST |
| `skill-doc-integrity.prompt.md` | Check skill inventory, matrix coverage, and skill file integrity. | Daily 03:00 KST |
| `code-doc-align.prompt.md` | Check route/code/docs alignment and route evidence drift. | Daily 03:30 KST |
| `wave-status-sync.prompt.md` | Roll route and parity evidence into wave status summaries. | Daily 04:00 KST |
| `parity-cascade-sync.prompt.md` | Propagate parity status from board to matrix and project status. | Daily 04:30 KST |
| `automation-health-monitor.prompt.md` | Summarize automation run health and lock status. | Daily 05:00 KST |
| `memory-drift-reporter.prompt.md` | Report drift between memory summaries and status artifacts. | Daily 05:30 KST |
| `docs-nightly-organizer.prompt.md` | Organize daily logs into stable docs structure. | Daily 22:00 KST |

## Subagent-Aware Flow
- `skill-doc-integrity.prompt.md` verifies that subagent skills and their docs are registered and structurally complete.
- `code-doc-align.prompt.md` may delegate discovery to `subagent-doc-check` when drift analysis spans code, docs, and local `CLAUDE.md` chains.
- Automations only call subagent-style exploration for comparison and summarization, never for direct code edits.

## Execution Order
```text
02:00 schema-drift-detector
03:00 skill-doc-integrity
03:30 code-doc-align
04:00 wave-status-sync
04:30 parity-cascade-sync
05:00 automation-health-monitor
05:30 memory-drift-reporter
22:00 docs-nightly-organizer
```
