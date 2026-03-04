-- 20260304090001_matching_logic_v2.sql
-- High-fidelity Phase 2: weighted matching with safe JSONB overlap handling.

BEGIN;

--------------------------------------------------------------------------------
-- 1. UTILITY FUNCTIONS
--------------------------------------------------------------------------------

-- Generic overlap count for text arrays.
CREATE OR REPLACE FUNCTION public.array_overlap_count(arr1 TEXT[], arr2 TEXT[])
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(COUNT(*), 0)::INTEGER
  FROM (
    SELECT DISTINCT value
    FROM unnest(COALESCE(arr1, ARRAY[]::TEXT[])) AS value
  ) a
  JOIN (
    SELECT DISTINCT value
    FROM unnest(COALESCE(arr2, ARRAY[]::TEXT[])) AS value
  ) b USING (value)
$$;

-- activity_times is JSONB in current schema; this keeps overlap math type-safe.
CREATE OR REPLACE FUNCTION public.time_slot_overlap_count(lhs JSONB, rhs JSONB)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(COUNT(DISTINCT l.slot), 0)::INTEGER
  FROM jsonb_array_elements_text(COALESCE(lhs, '[]'::jsonb)) AS l(slot)
  JOIN jsonb_array_elements_text(COALESCE(rhs, '[]'::jsonb)) AS r(slot)
    ON l.slot = r.slot
  WHERE l.slot IN ('morning', 'afternoon', 'evening')
$$;

--------------------------------------------------------------------------------
-- 2. ADVANCED MATCHING RPC (v2)
--------------------------------------------------------------------------------
-- Weighted score:
-- distance (40) + time overlap (30) + trust (20) + diversity random (10)

CREATE OR REPLACE FUNCTION public.match_guardians_v2(
  p_guardian_id UUID,
  p_mode mode_type DEFAULT 'basic'::mode_type,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  target_guardian_id UUID,
  distance_meters FLOAT,
  time_overlap_score FLOAT, -- 0..100
  compatibility_score FLOAT,
  is_verified BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_my_location geography;
  v_my_radius_km INT;
  v_my_activity_times JSONB;
  v_radius_meters DOUBLE PRECISION;
BEGIN
  SELECT
    location,
    preferred_radius_km,
    COALESCE(activity_times, '[]'::jsonb)
  INTO
    v_my_location,
    v_my_radius_km,
    v_my_activity_times
  FROM public.guardians
  WHERE id = p_guardian_id
    AND deleted_at IS NULL;

  IF v_my_location IS NULL THEN
    RETURN;
  END IF;

  v_radius_meters := GREATEST(COALESCE(v_my_radius_km, 5), 1) * 1000.0;

  RETURN QUERY
  SELECT
    g.id AS target_guardian_id,
    ST_Distance(g.location, v_my_location) AS distance_meters,
    (
      (public.time_slot_overlap_count(v_my_activity_times, g.activity_times)::FLOAT / 3.0) * 100.0
    ) AS time_overlap_score,
    (
      ((1.0 - LEAST(ST_Distance(g.location, v_my_location) / v_radius_meters, 1.0)) * 40.0) +
      ((public.time_slot_overlap_count(v_my_activity_times, g.activity_times)::FLOAT / 3.0) * 30.0) +
      (COALESCE(u.trust_score, 36.5) / 100.0 * 20.0) +
      (random() * 10.0)
    ) AS compatibility_score,
    g.verified_region AS is_verified
  FROM public.guardians g
  LEFT JOIN public.users u ON u.id = g.user_id
  WHERE g.id <> p_guardian_id
    AND g.deleted_at IS NULL
    AND g.location IS NOT NULL
    AND (
      g.visibility_level <> 'private'::profile_visibility
      OR g.user_id = auth.uid()
    )
    AND ST_DWithin(g.location, v_my_location, v_radius_meters * 1.2)
    AND CASE
      WHEN p_mode = 'care'::mode_type THEN
        'care'::relation_purpose = ANY(COALESCE(g.usage_purpose, ARRAY['friend'::relation_purpose]))
      WHEN p_mode = 'family'::mode_type THEN
        'family'::relation_purpose = ANY(COALESCE(g.usage_purpose, ARRAY['friend'::relation_purpose]))
      ELSE TRUE
    END
    AND NOT EXISTS (
      SELECT 1
      FROM public.blocks b
      WHERE (b.blocker_id = p_guardian_id AND b.blocked_id = g.id)
         OR (b.blocker_id = g.id AND b.blocked_id = p_guardian_id)
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.matches m
      WHERE (m.from_guardian_id = p_guardian_id AND m.to_guardian_id = g.id)
         OR (m.from_guardian_id = g.id AND m.to_guardian_id = p_guardian_id)
    )
  ORDER BY
    compatibility_score DESC,
    distance_meters ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

COMMIT;
