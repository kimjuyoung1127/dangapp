# Root Structure: dangapp
이 레포지토리는 프론트엔드와 백엔드(Supabase) 구성이 분리되어 있습니다.

## 폴더 구조
- `frontend/`: Next.js 웹 어플리케이션 (프론트엔드)
- `supabase/`: Supabase 관련 설정 및 마이그레이션 (백엔드)
- `docs/`: 실행 상태판/패리티/라우트 보드/일일 로그
- `.claude/skills/page-skills`: route/feature 실행 스킬
- `.claude/skills/dang-guide`: 도메인 운영 스킬

## 실행 방법
루트 디렉토리에서도 다음 명령어를 사용할 수 있습니다:
- `npm run dev`: 프론트엔드 개발 서버 실행
- `npm run build`: 프론트엔드 빌드
- `npm run lint`: 린트 체크

모든 상세 개발 작업은 `frontend/` 폴더 내에서 진행하는 것을 권장합니다.

## 워크플로우 (필수)
- 실행 인덱스: `CLAUDE.md`
- 상태판: `docs/status/PROJECT-STATUS.md`
- 패리티 매트릭스: `docs/status/11-FEATURE-PARITY-MATRIX.md`
- 라우트 보드: `docs/status/PAGE-UPGRADE-BOARD.md`
- 스킬 매트릭스: `docs/status/SKILL-DOC-MATRIX.md`

## Supabase MCP 연결 (PAT)
1. 환경변수 설정
   - `export SUPABASE_ACCESS_TOKEN=...`
2. MCP 서버 등록
   - `codex mcp add supabase --url \"https://mcp.supabase.com/mcp?project_ref=fjpvtivpulreulfxmxfe\" --bearer-token-env-var SUPABASE_ACCESS_TOKEN`
3. 등록 확인
   - `codex mcp list`
