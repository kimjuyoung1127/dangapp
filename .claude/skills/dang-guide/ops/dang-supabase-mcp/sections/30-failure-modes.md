# 30 — Failure Modes

## 연결 실패

### 증상
- MCP 도구 호출 시 timeout 또는 connection refused
- "SUPABASE_ACCESS_TOKEN not set" 에러

### 대응
1. 환경변수 확인: `echo $SUPABASE_ACCESS_TOKEN`
2. 토큰 유효성: Supabase Dashboard → Settings → API에서 새 토큰 생성
3. MCP 서버 재시작: Claude Code 재시작
4. 네트워크: VPN/방화벽 확인

## 마이그레이션 충돌

### 증상
- `apply_migration` 실패
- "relation already exists" 에러
- "column already exists" 에러

### 대응
1. `execute_sql`로 현재 스키마 상태 확인
2. 충돌 테이블/컬럼이 이미 존재하면:
   - `CREATE TABLE IF NOT EXISTS` / `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` 사용
   - 또는 마이그레이션 파일 수정 후 재적용
3. 롤백 필요 시 역방향 마이그레이션 SQL 작성

## RLS 에러

### 증상
- "new row violates row-level security policy" 에러
- 데이터 조회 시 빈 결과 (RLS가 모든 행 차단)

### 대응
1. `SELECT * FROM pg_policies WHERE tablename = '...'`로 정책 확인
2. `auth.uid()` 반환값 확인 (인증 상태)
3. 정책 조건이 너무 제한적이면 완화
4. 테스트: `SET role authenticated; SET request.jwt.claims = '{"sub":"..."}';`

## 스토리지 정책 에러

### 증상
- 파일 업로드 실패 (403 Forbidden)
- 버킷 접근 불가

### 대응
1. `list_storage_buckets`로 버킷 존재 확인
2. 스토리지 정책 확인: `SELECT * FROM storage.policies WHERE bucket_id = '...'`
3. 공개/비공개 버킷 설정 확인
4. 파일 경로 패턴이 정책과 일치하는지 확인
