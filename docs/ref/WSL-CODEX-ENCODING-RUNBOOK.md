# WSL Codex Encoding Runbook

This runbook prevents encoding corruption by running Codex in WSL and validating UTF-8 on every lint/build.

## Goal
- Keep all text files UTF-8 (without BOM).
- Avoid UTF-16/CP949 corruption from Windows shell defaults.
- Keep line endings stable with Git normalization.

## One-time Setup (Windows + WSL)
1. Configure Git globally inside WSL:
   - `git config --global core.autocrlf input`
   - `git config --global core.eol lf`
   - `git config --global i18n.commitEncoding utf-8`
   - `git config --global i18n.logOutputEncoding utf-8`
2. Open project from WSL path (recommended):
   - `/mnt/c/Users/ezen601/Desktop/Jason/dangapp/dangapp`
3. Verify repository guard files exist:
   - `.editorconfig` (`charset = utf-8`, `end_of_line = lf`)
   - `.gitattributes` (`* text=auto eol=lf` and per-extension text rules)
4. Install dependencies from WSL shell:
   - `npm ci`
   - `cd frontend && npm ci`

## Daily Workflow (WSL)
1. Enter repo from WSL terminal.
2. Before coding:
   - `npm run check:encoding`
3. After changes:
   - `npm run lint`
   - `npm run build`
4. If checks pass, update docs:
   - `docs/daily/MM-DD/page-<route>.md`
   - `docs/status/PAGE-UPGRADE-BOARD.md`
   - `docs/status/PROJECT-STATUS.md` (when milestone/blocker status changed)

## If Encoding Check Fails
1. Identify file from output.
2. Re-save file as UTF-8 without BOM in WSL-capable editor.
3. Re-run:
   - `npm run check:encoding`
4. If line-ending noise appears, normalize with:
   - `git add --renormalize .`
   - re-run lint/build.

## Notes
- `npm run check:encoding` validates changed files by default.
- Full repository scan:
  - `node scripts/check-encoding.mjs --all`
- Do not bypass this check in CI/CD.