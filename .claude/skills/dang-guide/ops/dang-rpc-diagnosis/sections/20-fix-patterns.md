# 20 — Fix Patterns (원인별 수정)

## Pattern A: 거리 초과 (radius_ok: false)

**증상**: 모든 대상 행이 `radius_ok: false`, `distance_m`이 반경 초과.

**원인**: 기준 가디언과 대상 가디언의 좌표가 너무 멀리 떨어져 있음.

**수정**:
```sql
-- 기준 가디언의 좌표를 기반으로 대상 가디언을 근처에 분산 배치
-- ~0.01도 ≈ 서울 기준 약 1.1km
UPDATE guardians
SET location = (
    SELECT ST_SetSRID(ST_MakePoint(
        ST_X(location::geometry) + <lng_offset>,
        ST_Y(location::geometry) + <lat_offset>
    ), 4326)::geography
    FROM guardians WHERE id = '<기준_가디언_id>'
)
WHERE id = '<대상_가디언_id>';
```

**오프셋 참조** (서울 기준):
| 오프셋 | 대략 거리 |
|---|---|
| ±0.005 | ~500m |
| ±0.010 | ~1.1km |
| ±0.015 | ~1.6km |
| ±0.020 | ~2.2km |

---

## Pattern B: RLS 차단 (INSERT/UPDATE 500 에러)

**증상**: REST API에서 `500` 또는 `new row violates row-level security policy`.

**원인**: RLS 정책이 `auth.uid()` 기반으로 본인 행만 허용 → 상대방 행 삽입 불가.

**수정**: SECURITY DEFINER RPC로 우회.

```sql
CREATE OR REPLACE FUNCTION <operation_name>(
    p_my_id UUID, p_partner_id UUID
) RETURNS <return_type>
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 1. 소유권 검증 (필수)
    IF NOT EXISTS (
        SELECT 1 FROM guardians WHERE id = p_my_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- 2. 실제 작업 (RLS 우회됨)
    INSERT INTO <table> (...) VALUES (...);
END;
$$;
```

**프론트엔드 교체**:
```typescript
// Before: 직접 테이블 조작
await supabase.from("table").insert([...]);

// After: RPC 호출
await supabase.rpc("operation_name", { p_my_id: ..., p_partner_id: ... });
```

---

## Pattern C: 데이터 부재 (location IS NULL)

**증상**: RPC 내부에서 `v_my_location IS NULL` 조기 RETURN.

**수정 (시드)**:
```sql
UPDATE guardians
SET location = ST_SetSRID(ST_MakePoint(<lng>, <lat>), 4326)::geography,
    preferred_radius_km = COALESCE(preferred_radius_km, 5),
    activity_times = COALESCE(activity_times, '["morning","evening"]'::jsonb)
WHERE location IS NULL AND deleted_at IS NULL;
```

**프론트엔드 개선**: 위치 미설정 시 안내 UI 표시.
```tsx
<EmptyState reason={!guardian?.location ? "no-location" : "no-results"} />
```

---

## Pattern D: 이미 매칭된 관계 (is_matched: true)

**증상**: 매칭 가능한 상대가 전부 `is_matched: true`.

**수정 (dev 환경)**:
```sql
-- matches 테이블에서 테스트 데이터 정리
DELETE FROM matches
WHERE from_guardian_id = '<test_id>' OR to_guardian_id = '<test_id>';
```

**장기 대안**: 시드 가디언 추가로 매칭 대상 풀 확대.

---

## Pattern E: N+1 쿼리 (느린 성능)

**증상**: 네트워크 탭에서 방/약속 N개 × M개 쿼리 발생.

**수정**: for 루프 → 배치 `.in()` 조회.

```typescript
// Before: N+1
for (const item of items) {
    const { data } = await supabase.from("table").select("*").eq("id", item.partner_id).single();
}

// After: 배치
const ids = [...new Set(items.map(i => i.partner_id))];
const { data } = await supabase.from("table").select("*").in("id", Array.from(ids));
const map = new Map(data?.map(d => [d.id, d]));
```
