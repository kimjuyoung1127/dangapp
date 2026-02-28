-- 댕게팅 매칭 추천 알고리즘 (RPC)
-- 기준: 차단자 제외, 기매칭자 제외, 본인 제외
-- 정렬 기준: 거리 근접순 -> 활동 시간대 겹침 -> 신뢰 점수

CREATE OR REPLACE FUNCTION match_guardians(
  p_guardian_id UUID,
  p_limit INT DEFAULT 10,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  guardian_id UUID,
  distance_meters FLOAT,
  compatibility_score FLOAT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_my_location geography;
  v_my_radius INT;
  v_my_activity_times JSONB;
BEGIN
  -- 1. 내 정보 가져오기
  SELECT location, preferred_radius_km, activity_times 
  INTO v_my_location, v_my_radius, v_my_activity_times
  FROM public.guardians 
  WHERE id = p_guardian_id;

  -- 내 위치 정보가 없으면 빈 결과 반환 (아직 온보딩 미완료 등)
  IF v_my_location IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    g.id AS guardian_id,
    ST_Distance(g.location, v_my_location) AS distance_meters,
    (
      -- 기본 호환성 점수 연산 (임시 가중치: 신뢰도 + 랜덤)
      -- 추후 JSON 배열 교집합(시간대 등) 연산을 고도화할 수 있음.
      COALESCE((SELECT trust_score FROM public.users WHERE id = g.user_id), 0) + 
      (random() * 20) -- 약간의 발견성 부여
    ) AS compatibility_score
  FROM public.guardians g
  WHERE g.id != p_guardian_id -- 본인 제외
    -- 거리 필터 (내 반경 내에 있는 사람만)
    AND ST_DWithin(g.location, v_my_location, v_my_radius * 1000)
    -- 차단 제외
    AND NOT EXISTS (
      SELECT 1 FROM public.blocks b 
      WHERE (b.blocker_id = p_guardian_id AND b.blocked_id = g.id)
         OR (b.blocker_id = g.id AND b.blocked_id = p_guardian_id)
    )
    -- 이미 매칭 결과가 있는 사람 제외 (pending, accepted, rejected 모두)
    AND NOT EXISTS (
      SELECT 1 FROM public.matches m
      WHERE (m.from_guardian_id = p_guardian_id AND m.to_guardian_id = g.id)
         OR (m.from_guardian_id = g.id AND m.to_guardian_id = p_guardian_id)
    )
  ORDER BY 
    distance_meters ASC,           -- 1순위: 거리 가까운 순
    compatibility_score DESC       -- 2순위: 호환성 높은 순
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
