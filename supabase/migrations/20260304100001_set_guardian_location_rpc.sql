-- 20260304100001_set_guardian_location_rpc.sql
-- 보호자의 위치 정보(위도/경도)를 PostGIS POINT 형식으로 변환하여 저장합니다.
-- [Security Hardening] 요청자가 해당 가디언 레코드의 소유자인지 확인합니다.

CREATE OR REPLACE FUNCTION public.set_guardian_location(
  p_guardian_id UUID,
  p_lng DOUBLE PRECISION,
  p_lat DOUBLE PRECISION
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_user_id UUID;
BEGIN
  -- 1. 소유권 확인: 요청자가 해당 가디언의 user_id와 일치하는지 확인
  SELECT user_id INTO v_owner_user_id FROM public.guardians WHERE id = p_guardian_id;
  
  IF v_owner_user_id IS NULL OR v_owner_user_id != auth.uid() THEN
    RAISE EXCEPTION '이 정보를 업데이트할 권한이 없습니다.';
  END IF;

  -- 2. 좌표 유효성 검사
  IF p_lat < 33 OR p_lat > 39 OR p_lng < 124 OR p_lng > 132 THEN
    RAISE EXCEPTION '좌표 범위가 유효하지 않습니다: % (lat), % (lng)', p_lat, p_lng;
  END IF;

  -- 3. 저장
  UPDATE public.guardians
  SET 
    location = ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
    updated_at = NOW()
  WHERE id = p_guardian_id;
END;
$$;
