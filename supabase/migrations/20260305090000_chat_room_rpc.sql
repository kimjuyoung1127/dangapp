-- 20260305090000_chat_room_rpc.sql — chat_participants RLS 우회를 위한 SECURITY DEFINER RPC (DANG-CHT-001)
-- 문제: RLS INSERT 정책이 본인 행만 허용 → 상대방 participant 삽입 불가 → 500 에러
-- 해결: SECURITY DEFINER RPC로 소유권 검증 후 양쪽 participant 원자적 삽입

CREATE OR REPLACE FUNCTION create_chat_room_with_participants(
    p_my_guardian_id UUID,
    p_partner_guardian_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_room_id UUID;
BEGIN
    -- 소유권 검증: 호출자가 자기 guardian_id로만 요청 가능
    IF NOT EXISTS (
        SELECT 1 FROM guardians
        WHERE id = p_my_guardian_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Unauthorized: guardian does not belong to current user';
    END IF;

    -- 기존 DM 방 확인
    SELECT cr.id INTO v_room_id
    FROM chat_rooms cr
    WHERE cr.type = 'direct'
      AND EXISTS (
          SELECT 1 FROM chat_participants cp1
          WHERE cp1.room_id = cr.id AND cp1.guardian_id = p_my_guardian_id
      )
      AND EXISTS (
          SELECT 1 FROM chat_participants cp2
          WHERE cp2.room_id = cr.id AND cp2.guardian_id = p_partner_guardian_id
      );

    IF v_room_id IS NOT NULL THEN
        RETURN v_room_id;
    END IF;

    -- 새 방 생성
    INSERT INTO chat_rooms (type) VALUES ('direct')
    RETURNING id INTO v_room_id;

    -- 양쪽 참여자 삽입 (SECURITY DEFINER이므로 RLS 우회)
    INSERT INTO chat_participants (room_id, guardian_id) VALUES
        (v_room_id, p_my_guardian_id),
        (v_room_id, p_partner_guardian_id);

    RETURN v_room_id;
END;
$$;
