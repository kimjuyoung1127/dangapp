-- Core baseline RLS policies for existing public tables

BEGIN;

-- Users
DROP POLICY IF EXISTS app_users_select_self_v1 ON public.users;
CREATE POLICY app_users_select_self_v1 ON public.users
FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS app_users_update_self_v1 ON public.users;
CREATE POLICY app_users_update_self_v1 ON public.users
FOR UPDATE USING (id = auth.uid());

-- Guardians
DROP POLICY IF EXISTS app_guardians_select_all_v1 ON public.guardians;
CREATE POLICY app_guardians_select_all_v1 ON public.guardians
FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS app_guardians_insert_self_v1 ON public.guardians;
CREATE POLICY app_guardians_insert_self_v1 ON public.guardians
FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS app_guardians_update_self_v1 ON public.guardians;
CREATE POLICY app_guardians_update_self_v1 ON public.guardians
FOR UPDATE USING (user_id = auth.uid());

-- Dogs
DROP POLICY IF EXISTS app_dogs_select_all_v1 ON public.dogs;
CREATE POLICY app_dogs_select_all_v1 ON public.dogs
FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS app_dogs_insert_owner_v1 ON public.dogs;
CREATE POLICY app_dogs_insert_owner_v1 ON public.dogs
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.guardians g
        WHERE g.id = dogs.guardian_id
          AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_dogs_update_owner_v1 ON public.dogs;
CREATE POLICY app_dogs_update_owner_v1 ON public.dogs
FOR UPDATE USING (
    EXISTS (
        SELECT 1
        FROM public.guardians g
        WHERE g.id = dogs.guardian_id
          AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_dogs_delete_owner_v1 ON public.dogs;
CREATE POLICY app_dogs_delete_owner_v1 ON public.dogs
FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.guardians g
        WHERE g.id = dogs.guardian_id
          AND g.user_id = auth.uid()
    )
);

-- Matches
DROP POLICY IF EXISTS app_matches_select_participants_v1 ON public.matches;
CREATE POLICY app_matches_select_participants_v1 ON public.matches
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = matches.from_guardian_id AND g.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = matches.to_guardian_id AND g.user_id = auth.uid())
);

DROP POLICY IF EXISTS app_matches_insert_from_owner_v1 ON public.matches;
CREATE POLICY app_matches_insert_from_owner_v1 ON public.matches
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = matches.from_guardian_id AND g.user_id = auth.uid())
);

DROP POLICY IF EXISTS app_matches_update_participants_v1 ON public.matches;
CREATE POLICY app_matches_update_participants_v1 ON public.matches
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = matches.from_guardian_id AND g.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = matches.to_guardian_id AND g.user_id = auth.uid())
);

-- Blocks
DROP POLICY IF EXISTS app_blocks_select_participants_v1 ON public.blocks;
CREATE POLICY app_blocks_select_participants_v1 ON public.blocks
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = blocks.blocker_id AND g.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = blocks.blocked_id AND g.user_id = auth.uid())
);

DROP POLICY IF EXISTS app_blocks_insert_owner_v1 ON public.blocks;
CREATE POLICY app_blocks_insert_owner_v1 ON public.blocks
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = blocks.blocker_id AND g.user_id = auth.uid())
);

-- Chat participants and rooms
DROP POLICY IF EXISTS app_chat_rooms_select_participant_v1 ON public.chat_rooms;
CREATE POLICY app_chat_rooms_select_participant_v1 ON public.chat_rooms
FOR SELECT USING (
    EXISTS (
        SELECT 1
        FROM public.chat_participants cp
        JOIN public.guardians g ON g.id = cp.guardian_id
        WHERE cp.room_id = chat_rooms.id
          AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_chat_rooms_insert_auth_v1 ON public.chat_rooms;
CREATE POLICY app_chat_rooms_insert_auth_v1 ON public.chat_rooms
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS app_chat_participants_select_participant_v1 ON public.chat_participants;
CREATE POLICY app_chat_participants_select_participant_v1 ON public.chat_participants
FOR SELECT USING (
    EXISTS (
        SELECT 1
        FROM public.chat_participants cp2
        JOIN public.guardians g2 ON g2.id = cp2.guardian_id
        WHERE cp2.room_id = chat_participants.room_id
          AND g2.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_chat_participants_insert_owner_v1 ON public.chat_participants;
CREATE POLICY app_chat_participants_insert_owner_v1 ON public.chat_participants
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.guardians g
        WHERE g.id = chat_participants.guardian_id
          AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_chat_messages_select_participant_v1 ON public.chat_messages;
CREATE POLICY app_chat_messages_select_participant_v1 ON public.chat_messages
FOR SELECT USING (
    EXISTS (
        SELECT 1
        FROM public.chat_participants cp
        JOIN public.guardians g ON g.id = cp.guardian_id
        WHERE cp.room_id = chat_messages.room_id
          AND g.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS app_chat_messages_insert_sender_v1 ON public.chat_messages;
CREATE POLICY app_chat_messages_insert_sender_v1 ON public.chat_messages
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.guardians g
        WHERE g.id = chat_messages.sender_id
          AND g.user_id = auth.uid()
    )
    AND EXISTS (
        SELECT 1
        FROM public.chat_participants cp
        WHERE cp.room_id = chat_messages.room_id
          AND cp.guardian_id = chat_messages.sender_id
    )
);

-- Schedules
DROP POLICY IF EXISTS app_schedules_select_participants_v1 ON public.schedules;
CREATE POLICY app_schedules_select_participants_v1 ON public.schedules
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = schedules.organizer_id AND g.user_id = auth.uid())
    OR EXISTS (
        SELECT 1
        FROM public.guardians g
        WHERE g.user_id = auth.uid()
          AND g.id = ANY(schedules.participant_ids)
    )
);

DROP POLICY IF EXISTS app_schedules_insert_organizer_v1 ON public.schedules;
CREATE POLICY app_schedules_insert_organizer_v1 ON public.schedules
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = schedules.organizer_id AND g.user_id = auth.uid())
);

DROP POLICY IF EXISTS app_schedules_update_participants_v1 ON public.schedules;
CREATE POLICY app_schedules_update_participants_v1 ON public.schedules
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = schedules.organizer_id AND g.user_id = auth.uid())
    OR EXISTS (
        SELECT 1
        FROM public.guardians g
        WHERE g.user_id = auth.uid()
          AND g.id = ANY(schedules.participant_ids)
    )
);

-- Danglog
DROP POLICY IF EXISTS app_danglogs_select_all_v1 ON public.danglogs;
CREATE POLICY app_danglogs_select_all_v1 ON public.danglogs
FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS app_danglogs_insert_author_v1 ON public.danglogs;
CREATE POLICY app_danglogs_insert_author_v1 ON public.danglogs
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = danglogs.author_id AND g.user_id = auth.uid())
);

DROP POLICY IF EXISTS app_danglogs_update_author_v1 ON public.danglogs;
CREATE POLICY app_danglogs_update_author_v1 ON public.danglogs
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = danglogs.author_id AND g.user_id = auth.uid())
);

DROP POLICY IF EXISTS app_danglogs_delete_author_v1 ON public.danglogs;
CREATE POLICY app_danglogs_delete_author_v1 ON public.danglogs
FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = danglogs.author_id AND g.user_id = auth.uid())
);

-- Danglog comments
DROP POLICY IF EXISTS app_danglog_comments_select_all_v1 ON public.danglog_comments;
CREATE POLICY app_danglog_comments_select_all_v1 ON public.danglog_comments
FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS app_danglog_comments_insert_author_v1 ON public.danglog_comments;
CREATE POLICY app_danglog_comments_insert_author_v1 ON public.danglog_comments
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = danglog_comments.author_id AND g.user_id = auth.uid())
);

DROP POLICY IF EXISTS app_danglog_comments_update_author_v1 ON public.danglog_comments;
CREATE POLICY app_danglog_comments_update_author_v1 ON public.danglog_comments
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = danglog_comments.author_id AND g.user_id = auth.uid())
);

DROP POLICY IF EXISTS app_danglog_comments_delete_author_v1 ON public.danglog_comments;
CREATE POLICY app_danglog_comments_delete_author_v1 ON public.danglog_comments
FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = danglog_comments.author_id AND g.user_id = auth.uid())
);

-- Danglog likes
DROP POLICY IF EXISTS app_danglog_likes_select_all_v1 ON public.danglog_likes;
CREATE POLICY app_danglog_likes_select_all_v1 ON public.danglog_likes
FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS app_danglog_likes_insert_owner_v1 ON public.danglog_likes;
CREATE POLICY app_danglog_likes_insert_owner_v1 ON public.danglog_likes
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = danglog_likes.guardian_id AND g.user_id = auth.uid())
);

DROP POLICY IF EXISTS app_danglog_likes_delete_owner_v1 ON public.danglog_likes;
CREATE POLICY app_danglog_likes_delete_owner_v1 ON public.danglog_likes
FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = danglog_likes.guardian_id AND g.user_id = auth.uid())
);

-- Reviews
DROP POLICY IF EXISTS app_reviews_select_all_v1 ON public.reviews;
CREATE POLICY app_reviews_select_all_v1 ON public.reviews
FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS app_reviews_insert_author_v1 ON public.reviews;
CREATE POLICY app_reviews_insert_author_v1 ON public.reviews
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = reviews.author_id AND g.user_id = auth.uid())
);

-- Trust badges
DROP POLICY IF EXISTS app_trust_badges_select_all_v1 ON public.trust_badges;
CREATE POLICY app_trust_badges_select_all_v1 ON public.trust_badges
FOR SELECT USING (TRUE);

-- Notifications
DROP POLICY IF EXISTS app_notifications_select_owner_v1 ON public.notifications;
CREATE POLICY app_notifications_select_owner_v1 ON public.notifications
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS app_notifications_update_owner_v1 ON public.notifications;
CREATE POLICY app_notifications_update_owner_v1 ON public.notifications
FOR UPDATE USING (user_id = auth.uid());

-- Mode unlocks
DROP POLICY IF EXISTS app_mode_unlocks_select_owner_v1 ON public.mode_unlocks;
CREATE POLICY app_mode_unlocks_select_owner_v1 ON public.mode_unlocks
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = mode_unlocks.guardian_id AND g.user_id = auth.uid())
);

COMMIT;
