-- 20260304090000_schema_high_fidelity_phase1.sql
-- 고도화 Phase 1: 인증 동기화, 프로필 가시성 및 지역 인증 이력 관리

BEGIN;

--------------------------------------------------------------------------------
-- 1. ENUMS & TYPES
--------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE public.profile_visibility AS ENUM ('all', 'neighbors', 'friends', 'private');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

--------------------------------------------------------------------------------
-- 2. AUTH SYNC TRIGGER (CRITICAL)
--------------------------------------------------------------------------------
-- auth.users 생성을 감지하여 public.users를 자동으로 생성하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_email TEXT;
  v_phone TEXT;
BEGIN
  -- users.email is NOT NULL in public schema, so keep signup resilient even for phone-only users.
  v_email := COALESCE(
    NEW.email,
    NEW.raw_user_meta_data ->> 'email',
    CONCAT(NEW.id::text, '@no-email.local')
  );

  v_phone := COALESCE(
    NEW.phone,
    NEW.raw_user_meta_data ->> 'phone'
  );

  BEGIN
    INSERT INTO public.users (id, email, phone, role, trust_score, trust_level)
    VALUES (
      NEW.id,
      v_email,
      v_phone,
      'user'::user_role,
      36.5,
      1
    )
    ON CONFLICT (id) DO UPDATE
      SET email = COALESCE(users.email, EXCLUDED.email),
          phone = COALESCE(users.phone, EXCLUDED.phone),
          updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    -- Fail-open to avoid auth signup rollback; backfill can reconcile later.
    RAISE WARNING 'public.handle_new_user failed for auth user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 트리거 설정
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

--------------------------------------------------------------------------------
-- 3. CORE TABLE ENRICHMENT (Guardians & Dogs)
--------------------------------------------------------------------------------
-- Guardians 테이블 확장
ALTER TABLE public.guardians
    ADD COLUMN IF NOT EXISTS visibility_level public.profile_visibility DEFAULT 'all'::public.profile_visibility,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- Dogs 테이블 확장
ALTER TABLE public.dogs
    ADD COLUMN IF NOT EXISTS is_main_dog BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

--------------------------------------------------------------------------------
-- 4. NEW TABLES (Persistence & Verification)
--------------------------------------------------------------------------------
-- 지역 인증 이력 관리 (여러 지역 인증 또는 이력 추적용)
CREATE TABLE IF NOT EXISTS public.verified_regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
    address_name TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    b_code TEXT, -- 법정동 코드
    verified_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ, -- 인증 만료일 (필요 시)
    is_primary BOOLEAN DEFAULT TRUE
);

-- 신뢰 점수 변동 이력 (Audit Log)
CREATE TABLE IF NOT EXISTS public.trust_score_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    score_change NUMERIC(5,2) NOT NULL,
    new_score NUMERIC(5,2) NOT NULL,
    reason TEXT NOT NULL,
    related_match_id UUID, -- 매칭 리뷰 등에 의한 변동 시 참조
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

--------------------------------------------------------------------------------
-- 5. INDEXES & RLS REFINEMENT
--------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_guardians_visibility ON public.guardians(visibility_level) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_guardians_location_gist ON public.guardians USING GIST(location) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_verified_regions_location ON public.verified_regions USING GIST(location);

-- Guard soft-delete/private visibility at policy layer.
DROP POLICY IF EXISTS app_guardians_select_all_v1 ON public.guardians;
CREATE POLICY app_guardians_select_all_v1 ON public.guardians
FOR SELECT USING (
    deleted_at IS NULL
    AND (
      visibility_level <> 'private'::public.profile_visibility
      OR user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_dogs_select_all_v1 ON public.dogs;
CREATE POLICY app_dogs_select_all_v1 ON public.dogs
FOR SELECT USING (
    dogs.deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = dogs.guardian_id
        AND g.deleted_at IS NULL
        AND (
          g.visibility_level <> 'private'::public.profile_visibility
          OR g.user_id = auth.uid()
        )
    )
);

-- RLS on new tables added in this phase.
ALTER TABLE public.verified_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_score_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_verified_regions_select_owner_v1 ON public.verified_regions;
CREATE POLICY app_verified_regions_select_owner_v1 ON public.verified_regions
FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = verified_regions.guardian_id
        AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_verified_regions_insert_owner_v1 ON public.verified_regions;
CREATE POLICY app_verified_regions_insert_owner_v1 ON public.verified_regions
FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = verified_regions.guardian_id
        AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_verified_regions_update_owner_v1 ON public.verified_regions;
CREATE POLICY app_verified_regions_update_owner_v1 ON public.verified_regions
FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = verified_regions.guardian_id
        AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_verified_regions_delete_owner_v1 ON public.verified_regions;
CREATE POLICY app_verified_regions_delete_owner_v1 ON public.verified_regions
FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = verified_regions.guardian_id
        AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_trust_score_history_select_owner_v1 ON public.trust_score_history;
CREATE POLICY app_trust_score_history_select_owner_v1 ON public.trust_score_history
FOR SELECT USING (user_id = auth.uid());

COMMIT;
