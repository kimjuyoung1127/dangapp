-- 20260305090001_seed_guardian_locations.sql — 매칭 검증용 가디언 위치 시딩 (DANG-MAT-001)
-- 기존 가디언 중 location이 NULL인 레코드에 서울 강남역 부근 좌표 설정

UPDATE public.guardians
SET location = ST_SetSRID(ST_MakePoint(127.0276, 37.4979), 4326)::geography,
    preferred_radius_km = COALESCE(preferred_radius_km, 5),
    activity_times = COALESCE(activity_times, '["morning", "evening"]'::jsonb),
    updated_at = NOW()
WHERE location IS NULL
  AND deleted_at IS NULL;
