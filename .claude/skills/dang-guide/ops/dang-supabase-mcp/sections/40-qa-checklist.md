# 40 — QA Checklist

## 테이블 검증 쿼리

### 전체 테이블 목록
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 테이블 컬럼 확인
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = '<table>' AND table_schema = 'public';
```

### 외래 키 관계 확인
```sql
SELECT tc.constraint_name, tc.table_name, kcu.column_name,
       ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = '<table>';
```

## RLS 정책 검증

### 특정 테이블의 RLS 정책
```sql
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies WHERE tablename = '<table>';
```

### RLS 활성화 여부
```sql
SELECT relname, relrowsecurity FROM pg_class
WHERE relname IN ('guardians', 'dogs', 'matches', 'chat_messages', 'danglogs');
```

## 스토리지 검증

### 버킷 목록
MCP: `list_storage_buckets`

### 스토리지 정책
```sql
SELECT name, bucket_id, definition FROM storage.policies;
```

## Wave 1 검증 체크리스트
- [ ] `guardians` 테이블 + RLS
- [ ] `dogs` 테이블 + RLS
- [ ] `matches` 테이블 + RLS
- [ ] `chat_rooms` + `chat_participants` + `chat_messages` + RLS
- [ ] `schedules` 테이블 + RLS
- [ ] `danglogs` + `danglog_comments` + `danglog_likes` + RLS
- [ ] `danglog_collaborators` + `danglog_invites` + RLS
- [ ] `walk_records` + `walk_reviews` + RLS
- [ ] `notification_settings` + RLS
- [ ] `consent_logs` + RLS
- [ ] `care_requests` + RLS
- [ ] `family_groups` + `family_members` + RLS
- [ ] `mode_unlocks` + RLS
- [ ] `trust_badges` + RLS
- [ ] `dog-profiles` 버킷 + 정책
- [ ] `dog-documents` 버킷 + 정책
- [ ] `danglog-media` 버킷 + 정책
- [ ] `walk-photos` 버킷 + 정책
