-- Backfill scheduleId metadata for legacy chat schedule messages.
-- This prevents non-clickable accept/reject actions for old schedule cards.

BEGIN;

DO $$
DECLARE
    rec RECORD;
    v_schedule_id UUID;
    v_organizer_id UUID;
    v_location TEXT;
    v_datetime TIMESTAMPTZ;
    v_participant_ids UUID[];
BEGIN
    FOR rec IN
        SELECT id, room_id, sender_id, metadata
        FROM public.chat_messages
        WHERE type = 'schedule'
          AND (metadata IS NULL OR COALESCE(metadata->>'scheduleId', '') = '')
    LOOP
        v_location := NULLIF(BTRIM(COALESCE(rec.metadata->>'location', '')), '');

        IF COALESCE(rec.metadata->>'date', '') = '' OR COALESCE(rec.metadata->>'time', '') = '' THEN
            CONTINUE;
        END IF;

        BEGIN
            v_datetime :=
                (
                    (rec.metadata->>'date') || ' ' || SUBSTRING(rec.metadata->>'time' FROM 1 FOR 5)
                )::timestamp AT TIME ZONE 'Asia/Seoul';
        EXCEPTION WHEN OTHERS THEN
            CONTINUE;
        END;

        v_organizer_id := rec.sender_id;
        IF v_organizer_id IS NULL THEN
            SELECT cp.guardian_id
            INTO v_organizer_id
            FROM public.chat_participants cp
            WHERE cp.room_id = rec.room_id
            ORDER BY cp.joined_at
            LIMIT 1;
        END IF;

        IF v_organizer_id IS NULL THEN
            CONTINUE;
        END IF;

        SELECT ARRAY_AGG(cp.guardian_id ORDER BY cp.joined_at)
        INTO v_participant_ids
        FROM public.chat_participants cp
        WHERE cp.room_id = rec.room_id;

        IF v_participant_ids IS NULL OR COALESCE(ARRAY_LENGTH(v_participant_ids, 1), 0) = 0 THEN
            v_participant_ids := ARRAY[v_organizer_id];
        END IF;

        SELECT s.id
        INTO v_schedule_id
        FROM public.schedules s
        WHERE s.room_id = rec.room_id
          AND s.datetime = v_datetime
          AND s.organizer_id = v_organizer_id
          AND (
              v_location IS NULL
              OR COALESCE(s.location_name, '') = v_location
              OR COALESCE(s.place_detail, '') = v_location
          )
        ORDER BY s.created_at DESC
        LIMIT 1;

        IF v_schedule_id IS NULL THEN
            INSERT INTO public.schedules (
                room_id,
                organizer_id,
                title,
                location_name,
                place_detail,
                datetime,
                status,
                proposal_status,
                participant_ids
            )
            VALUES (
                rec.room_id,
                v_organizer_id,
                '채팅 약속 제안',
                v_location,
                v_location,
                v_datetime,
                'proposed',
                'proposed',
                v_participant_ids
            )
            RETURNING id INTO v_schedule_id;
        END IF;

        UPDATE public.chat_messages
        SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('scheduleId', v_schedule_id::text)
        WHERE id = rec.id;
    END LOOP;
END $$;

COMMIT;
