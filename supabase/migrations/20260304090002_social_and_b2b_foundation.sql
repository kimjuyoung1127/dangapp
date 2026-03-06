-- 20260304090002_social_and_b2b_foundation.sql
-- 고도화 Phase 3: 가족 계정, 다중 참여 일정 및 B2B 파트너 인프라 구축

BEGIN;

--------------------------------------------------------------------------------
-- 1. 가족 계정 (N:M Dog-Guardian Relationship)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dog_ownership (
    dog_id UUID REFERENCES public.dogs(id) ON DELETE CASCADE,
    guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'owner', -- 'owner' (주보호자), 'co_owner' (부보호자), 'sitter' (임시보호)
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (dog_id, guardian_id),
    CONSTRAINT dog_ownership_role_check CHECK (role IN ('owner', 'co_owner', 'sitter'))
);

--------------------------------------------------------------------------------
-- 2. 일정 다중 참여자 (Advanced Scheduling)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schedule_participants (
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
    guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE,
    dog_id UUID REFERENCES public.dogs(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'invited', -- 'invited', 'accepted', 'declined'
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (schedule_id, guardian_id),
    CONSTRAINT schedule_participants_status_check CHECK (status IN ('invited', 'accepted', 'declined'))
);

--------------------------------------------------------------------------------
-- 3. B2B 파트너 장소 및 예약 기초 (Partner Infrastructure)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.partner_places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'cafe', 'hospital', 'salon', 'park'
    address_name TEXT,
    location GEOGRAPHY(POINT, 4326),
    description TEXT,
    photo_urls TEXT[] DEFAULT '{}',
    business_hours JSONB, -- { "mon": "09:00-18:00", ... }
    is_verified BOOLEAN DEFAULT FALSE,
    amenities TEXT[] DEFAULT '{}', -- ['parking', 'wifi', 'dog_menu']
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 예약(Reservations) 테이블
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID REFERENCES public.partner_places(id) ON DELETE CASCADE,
    guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE,
    dog_id UUID REFERENCES public.dogs(id) ON DELETE SET NULL,
    reserved_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
    guest_count INTEGER DEFAULT 1,
    request_memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

--------------------------------------------------------------------------------
-- 4. 신고 시스템 (Reporting & Trust)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES public.guardians(id) ON DELETE SET NULL,
    target_guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE,
    reason_category TEXT NOT NULL, -- 'spam', 'abuse', 'dangerous_dog', 'no_show'
    content TEXT,
    evidence_urls TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewing', 'resolved', 'dismissed'
    admin_memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

--------------------------------------------------------------------------------
-- 5. INDEXES & TRIGGERS
--------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_dog_ownership_guardian_id ON public.dog_ownership(guardian_id);
CREATE INDEX IF NOT EXISTS idx_schedule_participants_guardian_id ON public.schedule_participants(guardian_id);
CREATE INDEX IF NOT EXISTS idx_partner_places_location ON public.partner_places USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_reservations_place_id ON public.reservations(place_id);
CREATE INDEX IF NOT EXISTS idx_reservations_guardian_id ON public.reservations(guardian_id);
CREATE INDEX IF NOT EXISTS idx_reservations_reserved_at ON public.reservations(reserved_at);
CREATE INDEX IF NOT EXISTS idx_reports_target_guardian ON public.reports(target_guardian_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_id);

DROP TRIGGER IF EXISTS update_partner_places_modtime ON public.partner_places;
CREATE TRIGGER update_partner_places_modtime
BEFORE UPDATE ON public.partner_places
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

--------------------------------------------------------------------------------
-- 6. RLS FOR NEW TABLES
--------------------------------------------------------------------------------
ALTER TABLE public.dog_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- dog_ownership
DROP POLICY IF EXISTS app_dog_ownership_select_related_v1 ON public.dog_ownership;
CREATE POLICY app_dog_ownership_select_related_v1 ON public.dog_ownership
FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = dog_ownership.guardian_id
        AND g.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.dog_ownership o2
      JOIN public.guardians g2 ON g2.id = o2.guardian_id
      WHERE o2.dog_id = dog_ownership.dog_id
        AND g2.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_dog_ownership_insert_self_v1 ON public.dog_ownership;
CREATE POLICY app_dog_ownership_insert_self_v1 ON public.dog_ownership
FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = dog_ownership.guardian_id
        AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_dog_ownership_update_self_v1 ON public.dog_ownership;
CREATE POLICY app_dog_ownership_update_self_v1 ON public.dog_ownership
FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = dog_ownership.guardian_id
        AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_dog_ownership_delete_self_v1 ON public.dog_ownership;
CREATE POLICY app_dog_ownership_delete_self_v1 ON public.dog_ownership
FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = dog_ownership.guardian_id
        AND g.user_id = auth.uid()
    )
);

-- schedule_participants
DROP POLICY IF EXISTS app_schedule_participants_select_related_v1 ON public.schedule_participants;
CREATE POLICY app_schedule_participants_select_related_v1 ON public.schedule_participants
FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = schedule_participants.guardian_id
        AND g.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.schedules s
      JOIN public.guardians og ON og.id = s.organizer_id
      WHERE s.id = schedule_participants.schedule_id
        AND og.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_schedule_participants_insert_related_v1 ON public.schedule_participants;
CREATE POLICY app_schedule_participants_insert_related_v1 ON public.schedule_participants
FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = schedule_participants.guardian_id
        AND g.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.schedules s
      JOIN public.guardians og ON og.id = s.organizer_id
      WHERE s.id = schedule_participants.schedule_id
        AND og.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_schedule_participants_update_related_v1 ON public.schedule_participants;
CREATE POLICY app_schedule_participants_update_related_v1 ON public.schedule_participants
FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = schedule_participants.guardian_id
        AND g.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.schedules s
      JOIN public.guardians og ON og.id = s.organizer_id
      WHERE s.id = schedule_participants.schedule_id
        AND og.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_schedule_participants_delete_related_v1 ON public.schedule_participants;
CREATE POLICY app_schedule_participants_delete_related_v1 ON public.schedule_participants
FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = schedule_participants.guardian_id
        AND g.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.schedules s
      JOIN public.guardians og ON og.id = s.organizer_id
      WHERE s.id = schedule_participants.schedule_id
        AND og.user_id = auth.uid()
    )
);

-- partner_places
DROP POLICY IF EXISTS app_partner_places_select_auth_v1 ON public.partner_places;
CREATE POLICY app_partner_places_select_auth_v1 ON public.partner_places
FOR SELECT USING (auth.role() IN ('authenticated', 'service_role'));

DROP POLICY IF EXISTS app_partner_places_mutate_service_v1 ON public.partner_places;
CREATE POLICY app_partner_places_mutate_service_v1 ON public.partner_places
FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- reservations
DROP POLICY IF EXISTS app_reservations_select_related_v1 ON public.reservations;
CREATE POLICY app_reservations_select_related_v1 ON public.reservations
FOR SELECT USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = reservations.guardian_id
        AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_reservations_insert_owner_v1 ON public.reservations;
CREATE POLICY app_reservations_insert_owner_v1 ON public.reservations
FOR INSERT WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = reservations.guardian_id
        AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_reservations_update_owner_v1 ON public.reservations;
CREATE POLICY app_reservations_update_owner_v1 ON public.reservations
FOR UPDATE USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = reservations.guardian_id
        AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_reservations_delete_owner_v1 ON public.reservations;
CREATE POLICY app_reservations_delete_owner_v1 ON public.reservations
FOR DELETE USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = reservations.guardian_id
        AND g.user_id = auth.uid()
    )
);

-- reports
DROP POLICY IF EXISTS app_reports_select_related_v1 ON public.reports;
CREATE POLICY app_reports_select_related_v1 ON public.reports
FOR SELECT USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = reports.reporter_id
        AND g.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = reports.target_guardian_id
        AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_reports_insert_reporter_v1 ON public.reports;
CREATE POLICY app_reports_insert_reporter_v1 ON public.reports
FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.guardians g
      WHERE g.id = reports.reporter_id
        AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_reports_update_service_v1 ON public.reports;
CREATE POLICY app_reports_update_service_v1 ON public.reports
FOR UPDATE USING (auth.role() = 'service_role');

COMMIT;
