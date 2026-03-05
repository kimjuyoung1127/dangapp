-- 20260305110000_security_hardening_search_path_and_spatial_rls.sql
-- DANG-INFRA-001 follow-up.
-- NOTE:
--   `public.spatial_ref_sys` is owned by `supabase_admin` on hosted projects.
--   In current MCP session (`postgres`) ALTER TABLE ... ENABLE RLS fails with:
--   "must be owner of table spatial_ref_sys".
--   Keep this migration focused on function search_path hardening.
--   Track `spatial_ref_sys` as an infra risk until owner-context change is available.

BEGIN;

ALTER FUNCTION public.update_updated_at_column()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.match_guardians(uuid, integer, integer)
  SET search_path = public, pg_temp;

ALTER FUNCTION public.time_slot_overlap_count(jsonb, jsonb)
  SET search_path = public, pg_temp;

ALTER FUNCTION public.array_overlap_count(text[], text[])
  SET search_path = public, pg_temp;

ALTER FUNCTION public.set_guardian_location(uuid, double precision, double precision)
  SET search_path = public, pg_temp;

COMMIT;
