# .githooks/

Local Git hook scripts for repository safety checks.

- Keep hooks small and deterministic.
- Use hooks to block unsafe commits before they leave the machine.
- Prefer calling repo scripts instead of duplicating logic inside hook files.
