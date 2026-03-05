-- 20260305133000_fix_family_rls_recursion.sql
-- Fix infinite recursion in family_members/family_groups RLS policies.

BEGIN;

CREATE OR REPLACE FUNCTION public.app_is_family_member(p_group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
      SELECT 1
      FROM public.family_groups fg
      WHERE fg.id = p_group_id
        AND fg.creator_id = auth.uid()
  )
  OR EXISTS (
      SELECT 1
      FROM public.family_members fm
      WHERE fm.group_id = p_group_id
        AND fm.member_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.app_can_manage_family_group(p_group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
      SELECT 1
      FROM public.family_groups fg
      WHERE fg.id = p_group_id
        AND fg.creator_id = auth.uid()
  )
  OR EXISTS (
      SELECT 1
      FROM public.family_members fm
      WHERE fm.group_id = p_group_id
        AND fm.member_id = auth.uid()
        AND fm.role IN ('owner', 'admin')
  );
$$;

GRANT EXECUTE ON FUNCTION public.app_is_family_member(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.app_can_manage_family_group(UUID) TO authenticated, service_role;

DROP POLICY IF EXISTS family_groups_select ON public.family_groups;
CREATE POLICY family_groups_select ON public.family_groups
FOR SELECT
USING (public.app_is_family_member(id));

DROP POLICY IF EXISTS family_groups_insert ON public.family_groups;
CREATE POLICY family_groups_insert ON public.family_groups
FOR INSERT
WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS family_groups_update ON public.family_groups;
CREATE POLICY family_groups_update ON public.family_groups
FOR UPDATE
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

DROP POLICY IF EXISTS family_groups_delete ON public.family_groups;
CREATE POLICY family_groups_delete ON public.family_groups
FOR DELETE
USING (creator_id = auth.uid());

DROP POLICY IF EXISTS family_members_select ON public.family_members;
CREATE POLICY family_members_select ON public.family_members
FOR SELECT
USING (public.app_is_family_member(group_id));

DROP POLICY IF EXISTS family_members_insert ON public.family_members;
CREATE POLICY family_members_insert ON public.family_members
FOR INSERT
WITH CHECK (
  public.app_can_manage_family_group(group_id)
  OR member_id = auth.uid()
);

DROP POLICY IF EXISTS family_members_update ON public.family_members;
CREATE POLICY family_members_update ON public.family_members
FOR UPDATE
USING (public.app_can_manage_family_group(group_id))
WITH CHECK (public.app_can_manage_family_group(group_id));

DROP POLICY IF EXISTS family_members_delete ON public.family_members;
CREATE POLICY family_members_delete ON public.family_members
FOR DELETE
USING (public.app_can_manage_family_group(group_id));

COMMIT;

