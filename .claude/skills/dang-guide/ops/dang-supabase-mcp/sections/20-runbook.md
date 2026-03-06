# 20 — Runbook

## 표준 절차: Preflight → Apply → Verify → Document

### 1. Preflight
- [ ] `SUPABASE_ACCESS_TOKEN` 환경변수 확인
- [ ] MCP 연결 테스트: `list_tables` 실행
- [ ] 현재 테이블 스냅샷 캡처
- [ ] 적용할 마이그레이션 파일 확인 (`supabase/migrations/`)
- [ ] RLS 정책 영향 범위 파악

### 2. Apply
- [ ] `apply_migration`으로 마이그레이션 적용
- [ ] 적용 순서: 스키마 → RLS → 스토리지 (의존성 순)
- [ ] 하나씩 적용하고 중간 검증

### 3. Verify
- [ ] `list_tables`로 새 테이블 존재 확인
- [ ] `execute_sql`로 컬럼/타입 확인
- [ ] RLS 정책 적용 확인: `SELECT * FROM pg_policies WHERE tablename = '...'`
- [ ] 스토리지 버킷 확인: `list_storage_buckets`

### 4. Document
- [ ] `docs/ref/SCHEMA-CHANGELOG.md` 업데이트
- [ ] `docs/status/PROJECT-STATUS.md` Wave 상태 업데이트
- [ ] 변경 사항을 daily log에 기록
- [ ] Completion Format 출력

## 마이그레이션 파일 컨벤션
- 파일명: `YYYYMMDDHHMMSS_description.sql`
- 위치: `supabase/migrations/`
- 현재 파일:
  - `20260302090000_wave1_schema_foundation.sql`
  - `20260302090500_core_rls_baseline.sql`
  - `20260302091000_wave1_storage_policies.sql`
