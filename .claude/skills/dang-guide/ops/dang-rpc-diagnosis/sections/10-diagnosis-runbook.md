# 10 — Diagnosis Runbook

## Phase 1: REST API로 현재 상태 확인

Docker/psql 없이도 Supabase REST API로 진단 가능.

### 1-1. 대상 테이블 데이터 확인

```bash
# .env.local에서 URL과 ANON_KEY 가져오기
SUPABASE_URL="https://fjpvtivpulreulfxmxfe.supabase.co"
ANON_KEY="<anon key from .env.local>"

# 테이블 데이터 조회
curl -s "${SUPABASE_URL}/rest/v1/<table>?select=<columns>&<filter>" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}"
```

### 1-2. RPC 직접 호출

```bash
curl -s "${SUPABASE_URL}/rest/v1/rpc/<function_name>" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"param1":"value1","param2":"value2"}'
```

**주의**: anon 키로 호출하면 `auth.uid()`가 NULL. SECURITY DEFINER RPC는 내부에서 auth 체크를 하므로 에러 날 수 있음. 이 경우 `auth.uid()` 검사를 우회하는 임시 디버그 RPC를 만든다.

### 1-3. 결과 분류

| 응답 | 의미 | 다음 단계 |
|---|---|---|
| `[]` | 필터 조건에 맞는 행 없음 | Phase 2로 |
| `{"code":"PGRST..."}` | PostgREST 에러 (테이블/컬럼 없음) | 스키마 확인 |
| `{"message":"..."}` | RLS 차단 또는 권한 에러 | Phase 3의 RLS 패턴 |
| 정상 데이터 | 프론트엔드 코드 문제 | 훅/컴포넌트 디버깅 |

---

## Phase 2: 임시 디버그 RPC로 필터 분해

빈 결과의 원인을 정확히 찾기 위해, RPC 내부의 각 필터 조건을 개별적으로 평가하는 **임시 디버그 RPC**를 생성한다.

### 2-1. 디버그 RPC 작성 원칙

```sql
CREATE OR REPLACE FUNCTION debug_<원본RPC명>(p_target_id UUID)
RETURNS TABLE (
    row_id UUID,
    row_label TEXT,
    filter_1_result BOOLEAN,   -- 각 WHERE 조건의 개별 결과
    filter_2_result BOOLEAN,
    filter_3_result BOOLEAN,
    raw_value_1 TEXT           -- 필터에 사용되는 실제 값
)
LANGUAGE plpgsql
SECURITY DEFINER              -- auth 우회
SET search_path = public
AS $$ ...
```

**핵심**: 원본 RPC의 WHERE 절을 하나씩 SELECT 절로 옮겨서 각 필터의 true/false를 반환.

### 2-2. 실전 예시 — match_guardians_v2 진단

원본 RPC의 WHERE 조건:
1. `g.id <> p_guardian_id` — 자기 자신 제외
2. `g.deleted_at IS NULL` — 삭제된 가디언 제외
3. `g.location IS NOT NULL` — 위치 미설정 제외
4. `g.visibility_level <> 'private'` — 비공개 프로필 제외
5. `ST_DWithin(g.location, v_my_location, radius)` — 반경 내
6. `NOT EXISTS (blocks)` — 차단 관계 제외
7. `NOT EXISTS (matches)` — 이미 매칭된 관계 제외

디버그 RPC에서 각 조건을 `BOOLEAN` 컬럼으로 노출:

```sql
SELECT
    g.id AS target_id,
    g.nickname AS target_nickname,
    ST_Distance(g.location, v_my_location)::FLOAT AS distance_m,
    g.location IS NOT NULL AS has_location,
    COALESCE(g.visibility_level::TEXT, 'NULL') AS visibility,
    EXISTS (SELECT 1 FROM blocks b WHERE ...) AS is_blocked,
    EXISTS (SELECT 1 FROM matches m WHERE ...) AS is_matched,
    ST_DWithin(g.location, v_my_location, radius) AS radius_ok
FROM guardians g
WHERE g.id <> p_guardian_id AND g.deleted_at IS NULL;
```

### 2-3. 디버그 RPC 적용/호출/정리

```bash
# 1. 마이그레이션으로 생성
echo "<SQL>" > supabase/migrations/YYYYMMDD_debug_xxx.sql
npx supabase db push

# 2. REST API로 호출
curl -s "${SUPABASE_URL}/rest/v1/rpc/debug_<name>" \
  -H "apikey: ${ANON_KEY}" -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"p_target_id":"<uuid>"}'

# 3. 결과 분석 후 디버그 RPC 삭제
echo "DROP FUNCTION IF EXISTS debug_<name>(UUID);" > supabase/migrations/YYYYMMDD_drop_debug.sql
npx supabase db push
```

### 2-4. 결과 해석

| 패턴 | 원인 | 다음 단계 |
|---|---|---|
| 모든 행 `radius_ok: false` | 좌표가 반경 밖 | sections/20 거리 패턴 |
| 모든 행 `is_matched: true` | 이미 전부 매칭됨 | matches 테이블 초기화 또는 시드 추가 |
| 모든 행 `has_location: false` | 위치 미설정 | 시드 SQL로 위치 설정 |
| 특정 행만 `visibility: private` | 프로필 비공개 | visibility_level 수정 |
| 대상 행 자체가 없음 | 가디언 데이터 부재 | 시드 가디언 생성 |

---

## Phase 3: Supabase CLI 활용법

### 마이그레이션 동기화 (히스토리 불일치 시)

```bash
# 현재 마이그레이션 상태 확인
npx supabase migration list

# 원격에만 있고 로컬에 없는 마이그레이션 → reverted 처리
npx supabase migration repair --status reverted <version>

# 로컬에만 있고 이미 수동 적용된 마이그레이션 → applied 마킹
npx supabase migration repair --status applied <version>

# 새 마이그레이션만 적용
npx supabase db push
```

### 프로젝트 링크

```bash
npx supabase link --project-ref fjpvtivpulreulfxmxfe
```
