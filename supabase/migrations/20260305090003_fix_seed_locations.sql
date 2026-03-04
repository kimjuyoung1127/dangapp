-- 20260305090003_fix_seed_locations.sql — 시드 가디언 좌표를 댕대디 근처로 분산 배치
-- 댕대디(테스트)는 이전에 설정된 좌표 유지, 시드 가디언들을 1~3km 반경 내로 이동

-- 먼저 댕대디의 좌표 기준으로 시드 가디언들을 근처에 배치
-- 댕대디 좌표를 기준으로 약간의 오프셋 추가 (서울 기준 ~0.01도 ≈ 1.1km)

-- 우주아빠: 댕대디 + 동쪽 1km
UPDATE public.guardians
SET location = (
    SELECT ST_SetSRID(ST_MakePoint(
        ST_X(location::geometry) + 0.009,
        ST_Y(location::geometry) + 0.003
    ), 4326)::geography
    FROM public.guardians WHERE id = 'a8b73aa4-8bbb-427f-af79-1a3dccec944e'
),
updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000011';

-- 루피언니: 댕대디 + 남쪽 1.5km
UPDATE public.guardians
SET location = (
    SELECT ST_SetSRID(ST_MakePoint(
        ST_X(location::geometry) - 0.005,
        ST_Y(location::geometry) - 0.010
    ), 4326)::geography
    FROM public.guardians WHERE id = 'a8b73aa4-8bbb-427f-af79-1a3dccec944e'
),
updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000022';

-- 먼동네친구: 댕대디 + 서쪽 2km
UPDATE public.guardians
SET location = (
    SELECT ST_SetSRID(ST_MakePoint(
        ST_X(location::geometry) - 0.015,
        ST_Y(location::geometry) + 0.005
    ), 4326)::geography
    FROM public.guardians WHERE id = 'a8b73aa4-8bbb-427f-af79-1a3dccec944e'
),
updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000033';

-- 다둥이네: 댕대디 + 북동쪽 2.5km
UPDATE public.guardians
SET location = (
    SELECT ST_SetSRID(ST_MakePoint(
        ST_X(location::geometry) + 0.018,
        ST_Y(location::geometry) + 0.012
    ), 4326)::geography
    FROM public.guardians WHERE id = 'a8b73aa4-8bbb-427f-af79-1a3dccec944e'
),
updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000044';
