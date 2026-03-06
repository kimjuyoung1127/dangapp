<!-- File: Local guide for the subagent-based doc consistency skill. -->
# subagent-doc-check

## Purpose
- Split repo-wide consistency checks into fixed discovery lanes before comparing drift.

## Structure
- `SKILL.md`: trigger conditions, discovery split, comparison workflow, and report format.

## Responsibilities
1. Collect code facts, docs facts, and local rule-chain facts separately.
2. Compare only after all three fact sets are gathered.
3. Report drift without mutating code as part of the discovery phase.
