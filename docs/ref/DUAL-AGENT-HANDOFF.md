# Dual-Agent Handoff Protocol

Claude + Codex 듀얼 에이전트 운용 프로토콜.

## Owner Convention

| Owner | Agent | When |
|---|---|---|
| `claude` | Claude Code (CLI) | MCP 연동, 복잡한 리팩토링, 스킬 작성, 문서 동기화 |
| `codex` | Codex (IDE) | 빠른 UI 수정, 컴포넌트 편집, 타입 수정 |
| `unassigned` | 미할당 | 아직 클레임되지 않은 태스크 |

## Session Protocol

### 세션 시작
1. `docs/status/PAGE-UPGRADE-BOARD.md`에서 자신의 owner 태스크 확인
2. `unassigned` 태스크 중 하나를 클레임 (owner를 자신으로 변경)
3. 상태를 `InProgress`로 변경

### 세션 중
- 다른 에이전트가 `InProgress`인 라우트는 건드리지 않음
- 공유 파일 수정 시 반드시 git status 확인 후 진행
- 충돌 방지: 동시에 같은 파일 편집 금지

### 세션 종료
1. Completion Format 출력
2. `docs/daily/MM-DD/page-<route>.md` 업데이트
3. `PAGE-UPGRADE-BOARD.md` 상태 업데이트 (InProgress → QA or Done)
4. owner를 `unassigned`로 되돌리거나 유지 (진행 중이면 유지)

## MCP Configuration

### Claude Code
- Config: `.mcp.json` (repo root)
- 환경변수: `SUPABASE_ACCESS_TOKEN`

### Codex
- Config: `codex mcp add supabase -- npx -y @supabase/mcp-server-supabase@latest --project-ref fjpvtivpulreulfxmxfe`
- 환경변수: 동일하게 `SUPABASE_ACCESS_TOKEN` 필요

## Conflict Resolution

1. 같은 파일에 대한 동시 수정 → 먼저 커밋한 쪽이 우선
2. Board owner가 있는 라우트는 해당 에이전트만 수정
3. 공유 파일 (types, hooks, store) → 수정 전 git pull 필수
