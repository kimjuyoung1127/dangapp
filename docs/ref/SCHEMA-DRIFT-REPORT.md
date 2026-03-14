# Schema Drift Report

## 2026-03-08 — S1-FIX: 15개 자동 등록 완료

완료된 자동 등록 (Auto-Documentation):
- 총 15개 미문서화 테이블 → SCHEMA-CHANGELOG.md에 자동 등록
- used: 13개 (care_requests, chat_messages, chat_participants, chat_rooms, danglog_comments, danglog_invites, danglog_likes, family_groups, family_members, mode_unlocks, schedules, trust_badges, walk_reviews)
- unused: 2개 (blocks, notifications)

### 등록 프로세스
1. database.types.ts에서 30개 전체 테이블 추출
2. SCHEMA-CHANGELOG.md에서 이미 문서화된 15개 테이블 확인
3. 미문서화 15개 테이블 식별
4. hooks 디렉토리 검사를 통해 각 테이블의 사용 여부 판별
5. 각 테이블에 대해 표준 documentation entry 생성 및 prepend

### 상세 등록 항목
- blocks (unused)
- care_requests (used in hooks)
- chat_messages (used in hooks)
- chat_participants (used in hooks)
- chat_rooms (used in hooks)
- danglog_comments (used in hooks)
- danglog_invites (used in hooks)
- danglog_likes (used in hooks)
- family_groups (used in hooks)
- family_members (used in hooks)
- mode_unlocks (used in hooks)
- notifications (unused)
- schedules (used in hooks)
- trust_badges (used in hooks)
- walk_reviews (used in hooks)

### 다음 단계
- 각 테이블의 상세 변경 이력은 individual feature development 시 추후 보완 필요
- types vs changelog parity 유지 (정기 동기화 권장)
