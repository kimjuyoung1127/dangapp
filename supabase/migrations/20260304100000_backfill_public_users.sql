-- 20260304100000_backfill_public_users.sql
-- 트리거 설치 전 가입한 기존 auth.users 유저들을 public.users로 안전하게 동기화합니다.

BEGIN;

INSERT INTO public.users (id, email, phone, role, trust_score, trust_level)
SELECT 
    id, 
    COALESCE(email, id::text || '@placeholder.com'), -- 이메일 미존재 시 대응
    phone, 
    'user'::public.user_role, 
    36.5, 
    1
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.users WHERE public.users.id = auth.users.id
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
