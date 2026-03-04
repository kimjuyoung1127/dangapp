-- seed_test_guardians.sql — 매칭 검증용 테스트 가디언 위치 시딩
-- 서울 강남역 부근 좌표 (37.4979, 127.0276)

-- 1. 기존 가디언 위치 설정 (location이 NULL인 경우만)
UPDATE public.guardians
SET location = ST_SetSRID(ST_MakePoint(127.0276, 37.4979), 4326)::geography,
    preferred_radius_km = 5,
    activity_times = '["morning", "evening"]'::jsonb,
    updated_at = NOW()
WHERE location IS NULL
  AND deleted_at IS NULL;

-- 2. 현재 가디언 수 확인
DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.guardians WHERE deleted_at IS NULL;
  RAISE NOTICE 'Total active guardians: %', v_count;
END $$;
