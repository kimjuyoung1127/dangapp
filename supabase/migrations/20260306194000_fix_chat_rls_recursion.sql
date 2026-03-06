-- Fix chat RLS recursion by using a SECURITY DEFINER membership function.
-- Error addressed: 42P17 infinite recursion detected in policy for relation "chat_participants".

BEGIN;

CREATE OR REPLACE FUNCTION public.is_room_participant(p_room_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.chat_participants cp
        JOIN public.guardians g ON g.id = cp.guardian_id
        WHERE cp.room_id = p_room_id
          AND g.user_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.is_room_participant(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_room_participant(UUID) TO authenticated;

DROP POLICY IF EXISTS app_chat_rooms_select_participant_v1 ON public.chat_rooms;
CREATE POLICY app_chat_rooms_select_participant_v1 ON public.chat_rooms
FOR SELECT USING (public.is_room_participant(chat_rooms.id));

DROP POLICY IF EXISTS app_chat_participants_select_participant_v1 ON public.chat_participants;
CREATE POLICY app_chat_participants_select_participant_v1 ON public.chat_participants
FOR SELECT USING (public.is_room_participant(chat_participants.room_id));

DROP POLICY IF EXISTS app_chat_messages_select_participant_v1 ON public.chat_messages;
CREATE POLICY app_chat_messages_select_participant_v1 ON public.chat_messages
FOR SELECT USING (public.is_room_participant(chat_messages.room_id));

COMMIT;
