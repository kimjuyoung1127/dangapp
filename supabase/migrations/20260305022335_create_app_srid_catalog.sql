-- 20260305123000_create_app_srid_catalog.sql
-- Introduce an app-owned SRID catalog so product code does not depend on
-- owner-restricted system table `public.spatial_ref_sys`.

BEGIN;

CREATE TABLE IF NOT EXISTS public.app_srid_catalog (
  srid INTEGER PRIMARY KEY CHECK (srid > 0),
  auth_name TEXT NOT NULL,
  srtext TEXT,
  proj4text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.app_srid_catalog IS
  'App-owned SRID catalog. Do not alter public.spatial_ref_sys in app migrations.';

INSERT INTO public.app_srid_catalog (srid, auth_name, srtext, proj4text, is_active)
VALUES (
  4326,
  'EPSG:4326',
  'WGS 84',
  '+proj=longlat +datum=WGS84 +no_defs',
  true
)
ON CONFLICT (srid) DO UPDATE
SET
  auth_name = EXCLUDED.auth_name,
  srtext = EXCLUDED.srtext,
  proj4text = EXCLUDED.proj4text,
  is_active = EXCLUDED.is_active,
  updated_at = now();

ALTER TABLE public.app_srid_catalog ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'app_srid_catalog'
      AND policyname = 'app_srid_catalog_select_public'
  ) THEN
    CREATE POLICY app_srid_catalog_select_public
      ON public.app_srid_catalog
      FOR SELECT
      TO anon, authenticated
      USING (is_active = true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'app_srid_catalog'
      AND policyname = 'app_srid_catalog_manage_service_role'
  ) THEN
    CREATE POLICY app_srid_catalog_manage_service_role
      ON public.app_srid_catalog
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_app_srid_catalog_updated_at'
      AND tgrelid = 'public.app_srid_catalog'::regclass
  ) THEN
    CREATE TRIGGER trg_app_srid_catalog_updated_at
      BEFORE UPDATE ON public.app_srid_catalog
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END;
$$;

COMMIT;
