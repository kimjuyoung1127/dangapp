-- Wave 1 schema foundation for DangApp full-scope requirements

BEGIN;

-- 1) Enums
DO $$ BEGIN
    CREATE TYPE relation_purpose AS ENUM ('friend', 'care', 'family');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE visibility_scope AS ENUM ('public', 'neighbor', 'private');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE time_slot AS ENUM ('morning', 'afternoon', 'evening');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE dog_trait_scale AS ENUM ('low', 'mid', 'high');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2) Core table expansions
ALTER TABLE public.guardians
    ADD COLUMN IF NOT EXISTS full_name TEXT,
    ADD COLUMN IF NOT EXISTS birth_date DATE,
    ADD COLUMN IF NOT EXISTS gender TEXT,
    ADD COLUMN IF NOT EXISTS usage_purpose relation_purpose[] DEFAULT ARRAY['friend'::relation_purpose],
    ADD COLUMN IF NOT EXISTS onboarding_progress INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS region_verified_at TIMESTAMPTZ;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'guardians_gender_valid'
    ) THEN
        ALTER TABLE public.guardians
            ADD CONSTRAINT guardians_gender_valid
            CHECK (gender IS NULL OR gender IN ('male', 'female', 'other'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'guardians_onboarding_progress_range'
    ) THEN
        ALTER TABLE public.guardians
            ADD CONSTRAINT guardians_onboarding_progress_range
            CHECK (onboarding_progress BETWEEN 0 AND 100);
    END IF;
END $$;

ALTER TABLE public.dogs
    ADD COLUMN IF NOT EXISTS birth_date DATE,
    ADD COLUMN IF NOT EXISTS temperament_profile JSONB NOT NULL DEFAULT '{}'::JSONB,
    ADD COLUMN IF NOT EXISTS weekday_walk_slots time_slot[] DEFAULT '{}'::time_slot[],
    ADD COLUMN IF NOT EXISTS weekend_walk_slots time_slot[] DEFAULT '{}'::time_slot[],
    ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::JSONB;

ALTER TABLE public.matches
    ADD COLUMN IF NOT EXISTS relation_purpose relation_purpose DEFAULT 'friend'::relation_purpose,
    ADD COLUMN IF NOT EXISTS intro_message VARCHAR(100),
    ADD COLUMN IF NOT EXISTS quick_message_code TEXT;

ALTER TABLE public.schedules
    ADD COLUMN IF NOT EXISTS proposal_status TEXT DEFAULT 'proposed',
    ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS place_detail TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'schedules_proposal_status_valid'
    ) THEN
        ALTER TABLE public.schedules
            ADD CONSTRAINT schedules_proposal_status_valid
            CHECK (proposal_status IN ('proposed', 'accepted', 'rejected', 'expired'));
    END IF;
END $$;

-- 3) New tables
CREATE TABLE IF NOT EXISTS public.walk_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE SET NULL,
    author_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
    partner_guardian_id UUID REFERENCES public.guardians(id) ON DELETE SET NULL,
    walk_date DATE NOT NULL DEFAULT CURRENT_DATE,
    walk_time TIMESTAMPTZ,
    place_name TEXT,
    memo TEXT,
    photo_urls TEXT[] DEFAULT '{}',
    visibility visibility_scope NOT NULL DEFAULT 'public'::visibility_scope,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT walk_records_memo_len CHECK (char_length(COALESCE(memo, '')) <= 500)
);

CREATE TABLE IF NOT EXISTS public.walk_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    walk_record_id UUID REFERENCES public.walk_records(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE SET NULL,
    author_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
    target_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(100),
    visibility visibility_scope NOT NULL DEFAULT 'public'::visibility_scope,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.danglog_collaborators (
    danglog_id UUID REFERENCES public.danglogs(id) ON DELETE CASCADE,
    guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'editor',
    invited_by UUID REFERENCES public.guardians(id) ON DELETE SET NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (danglog_id, guardian_id),
    CONSTRAINT danglog_collaborators_role_valid CHECK (role IN ('owner', 'editor', 'viewer'))
);

CREATE TABLE IF NOT EXISTS public.danglog_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    danglog_id UUID REFERENCES public.danglogs(id) ON DELETE CASCADE NOT NULL,
    invited_by UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
    invite_token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT danglog_invites_status_valid CHECK (status IN ('pending', 'accepted', 'expired', 'revoked'))
);

CREATE TABLE IF NOT EXISTS public.notification_settings (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
    chat_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
    schedule_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
    danglog_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
    push_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.consent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    consent_type TEXT NOT NULL,
    consented BOOLEAN NOT NULL,
    policy_version TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT consent_logs_type_valid CHECK (consent_type IN ('privacy', 'marketing', 'location', 'terms'))
);

-- 4) Indexes
CREATE INDEX IF NOT EXISTS idx_walk_records_author_id ON public.walk_records(author_id);
CREATE INDEX IF NOT EXISTS idx_walk_records_schedule_id ON public.walk_records(schedule_id);
CREATE INDEX IF NOT EXISTS idx_walk_reviews_author_id ON public.walk_reviews(author_id);
CREATE INDEX IF NOT EXISTS idx_walk_reviews_target_id ON public.walk_reviews(target_id);
CREATE INDEX IF NOT EXISTS idx_danglog_invites_danglog_id ON public.danglog_invites(danglog_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_user_id_created_at ON public.consent_logs(user_id, created_at DESC);

-- 5) updated_at triggers
DROP TRIGGER IF EXISTS update_walk_records_modtime ON public.walk_records;
CREATE TRIGGER update_walk_records_modtime
BEFORE UPDATE ON public.walk_records
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_settings_modtime ON public.notification_settings;
CREATE TRIGGER update_notification_settings_modtime
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6) Enable RLS on new tables
ALTER TABLE public.walk_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walk_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.danglog_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.danglog_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;

-- 7) Policies for new tables
DROP POLICY IF EXISTS app_walk_records_select_v1 ON public.walk_records;
CREATE POLICY app_walk_records_select_v1 ON public.walk_records
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.guardians g
        WHERE g.id = walk_records.author_id
          AND g.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1
        FROM public.guardians g
        WHERE g.id = walk_records.partner_guardian_id
          AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_walk_records_insert_v1 ON public.walk_records;
CREATE POLICY app_walk_records_insert_v1 ON public.walk_records
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.guardians g
        WHERE g.id = walk_records.author_id
          AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_walk_records_update_v1 ON public.walk_records;
CREATE POLICY app_walk_records_update_v1 ON public.walk_records
FOR UPDATE
USING (
    EXISTS (
        SELECT 1
        FROM public.guardians g
        WHERE g.id = walk_records.author_id
          AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_walk_reviews_select_v1 ON public.walk_reviews;
CREATE POLICY app_walk_reviews_select_v1 ON public.walk_reviews
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.guardians g
        WHERE g.id = walk_reviews.author_id AND g.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.guardians g
        WHERE g.id = walk_reviews.target_id AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_walk_reviews_insert_v1 ON public.walk_reviews;
CREATE POLICY app_walk_reviews_insert_v1 ON public.walk_reviews
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.guardians g
        WHERE g.id = walk_reviews.author_id
          AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_walk_reviews_update_v1 ON public.walk_reviews;
CREATE POLICY app_walk_reviews_update_v1 ON public.walk_reviews
FOR UPDATE
USING (
    EXISTS (
        SELECT 1
        FROM public.guardians g
        WHERE g.id = walk_reviews.author_id
          AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_danglog_collab_select_v1 ON public.danglog_collaborators;
CREATE POLICY app_danglog_collab_select_v1 ON public.danglog_collaborators
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.danglog_collaborators dc
        JOIN public.guardians g ON g.id = dc.guardian_id
        WHERE dc.danglog_id = danglog_collaborators.danglog_id
          AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_danglog_collab_insert_v1 ON public.danglog_collaborators;
CREATE POLICY app_danglog_collab_insert_v1 ON public.danglog_collaborators
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.guardians g
        WHERE g.id = danglog_collaborators.invited_by
          AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_danglog_invites_select_v1 ON public.danglog_invites;
CREATE POLICY app_danglog_invites_select_v1 ON public.danglog_invites
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.guardians g
        WHERE g.id = danglog_invites.invited_by
          AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_danglog_invites_insert_v1 ON public.danglog_invites;
CREATE POLICY app_danglog_invites_insert_v1 ON public.danglog_invites
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.guardians g
        WHERE g.id = danglog_invites.invited_by
          AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_danglog_invites_update_v1 ON public.danglog_invites;
CREATE POLICY app_danglog_invites_update_v1 ON public.danglog_invites
FOR UPDATE
USING (
    EXISTS (
        SELECT 1
        FROM public.guardians g
        WHERE g.id = danglog_invites.invited_by
          AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_notification_settings_select_v1 ON public.notification_settings;
CREATE POLICY app_notification_settings_select_v1 ON public.notification_settings
FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS app_notification_settings_insert_v1 ON public.notification_settings;
CREATE POLICY app_notification_settings_insert_v1 ON public.notification_settings
FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS app_notification_settings_update_v1 ON public.notification_settings;
CREATE POLICY app_notification_settings_update_v1 ON public.notification_settings
FOR UPDATE
USING (user_id = auth.uid());

DROP POLICY IF EXISTS app_consent_logs_select_v1 ON public.consent_logs;
CREATE POLICY app_consent_logs_select_v1 ON public.consent_logs
FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS app_consent_logs_insert_v1 ON public.consent_logs;
CREATE POLICY app_consent_logs_insert_v1 ON public.consent_logs
FOR INSERT
WITH CHECK (user_id = auth.uid());

COMMIT;
