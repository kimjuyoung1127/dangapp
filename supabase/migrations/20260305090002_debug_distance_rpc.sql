-- 임시 디버그용 RPC: 두 가디언 간 거리 계산 + 매칭 필터 진단
CREATE OR REPLACE FUNCTION debug_match_check(p_guardian_id UUID)
RETURNS TABLE (
    target_id UUID,
    target_nickname TEXT,
    distance_m FLOAT,
    has_location BOOLEAN,
    visibility TEXT,
    is_blocked BOOLEAN,
    is_matched BOOLEAN,
    radius_ok BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_my_location geography;
    v_my_radius_km INT;
BEGIN
    SELECT location, preferred_radius_km
    INTO v_my_location, v_my_radius_km
    FROM guardians WHERE id = p_guardian_id;

    IF v_my_location IS NULL THEN
        RAISE NOTICE 'Guardian % has NULL location', p_guardian_id;
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        g.id,
        g.nickname,
        ST_Distance(g.location, v_my_location)::FLOAT,
        g.location IS NOT NULL,
        COALESCE(g.visibility_level::TEXT, 'NULL'),
        EXISTS (
            SELECT 1 FROM blocks b
            WHERE (b.blocker_id = p_guardian_id AND b.blocked_id = g.id)
               OR (b.blocker_id = g.id AND b.blocked_id = p_guardian_id)
        ),
        EXISTS (
            SELECT 1 FROM matches m
            WHERE (m.from_guardian_id = p_guardian_id AND m.to_guardian_id = g.id)
               OR (m.from_guardian_id = g.id AND m.to_guardian_id = p_guardian_id)
        ),
        ST_DWithin(g.location, v_my_location, GREATEST(COALESCE(v_my_radius_km, 5), 1) * 1000.0 * 1.2)
    FROM guardians g
    WHERE g.id <> p_guardian_id AND g.deleted_at IS NULL;
END;
$$;
