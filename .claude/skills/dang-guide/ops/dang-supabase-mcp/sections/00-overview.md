# 00 — Overview

## MCP 서비스 컨텍스트

DangApp은 Supabase를 백엔드로 사용하며, Claude Code에서 MCP(Model Context Protocol)를 통해 Supabase에 직접 접근한다.

## 설정

### 환경변수
- `SUPABASE_ACCESS_TOKEN`: Supabase 개인 액세스 토큰 (필수)

### MCP 구성 파일
- `.mcp.json` (repo root):
  ```json
  {
    "mcpServers": {
      "supabase": {
        "command": "bash",
        "args": ["-lc", "npx -y @supabase/mcp-server-supabase@latest --project-ref fjpvtivpulreulfxmxfe --access-token \"$SUPABASE_ACCESS_TOKEN\""]
      }
    }
  }
  ```

### 프로젝트 정보
- Project ref: `fjpvtivpulreulfxmxfe`
- MCP 서버: `@supabase/mcp-server-supabase@latest`

## 사용 가능한 MCP 도구
- `list_tables`: 테이블 목록 조회
- `execute_sql`: SQL 실행
- `apply_migration`: 마이그레이션 적용
- `get_logs`: 로그 조회
- `list_extensions`: 확장 목록
- `list_storage_buckets`: 스토리지 버킷 목록
