## 2026-03-07 — Auto-Documented: consent_logs

Dawn Sweep S1 자동 등록. 상세 변경 이력은 추후 보완 필요.

### 테이블 구조
- 테이블: `consent_logs`
- 주요 컬럼: `user_id`, `consent_type`, `consented`, `policy_version`, `metadata`, `created_at`
- 상태: types에 정의됨, used (auth consent tracking)

---

## 2026-03-07 — Auto-Documented: danglog_collaborators

Dawn Sweep S1 자동 등록. 상세 변경 이력은 추후 보완 필요.

### 테이블 구조
- 테이블: `danglog_collaborators`
- 주요 컬럼: `danglog_id`, `guardian_id`, `role`, `invited_by`, `joined_at`
- 상태: types에 정의됨, used (co-author mapping)

---

## 2026-03-07 — Auto-Documented: danglogs

Dawn Sweep S1 자동 등록. 상세 변경 이력은 추후 보완 필요.

### 테이블 구조
- 테이블: `danglogs`
- 주요 컬럼: `author_id`, `dog_id`, `title`, `content`, `image_urls`, `activity_type`, `shared_with`, `co_authors`, `created_at`, `updated_at`
- 상태: types에 정의됨, used (walk/activity log entries)

---

## 2026-03-07 — Auto-Documented: dog_ownership

Dawn Sweep S1 자동 등록. 상세 변경 이력은 추후 보완 필요.

### 테이블 구조
- 테이블: `dog_ownership`
- 주요 컬럼: `dog_id`, `guardian_id`, `role`, `is_primary`, `created_at`
- 상태: types에 정의됨, used (dog-guardian N:M relationship)

---

## 2026-03-07 — Auto-Documented: dogs

Dawn Sweep S1 자동 등록. 상세 변경 이력은 추후 보완 필요.

### 테이블 구조
- 테이블: `dogs`
- 주요 컬럼: `guardian_id`, `name`, `breed`, `age`, `birth_date`, `weight_kg`, `temperament`, `weekday_walk_slots`, `weekend_walk_slots`, `gender`, `neutered`, `photo_urls`, `documents`, `created_at`, `updated_at`
- 상태: types에 정의됨, used (dog profile core table)

---

## 2026-03-07 — Auto-Documented: guardians

Dawn Sweep S1 자동 등록. 상세 변경 이력은 추후 보완 필요.

### 테이블 구조
- 테이블: `guardians`
- 주요 컬럼: `user_id`, `nickname`, `full_name`, `birth_date`, `gender`, `avatar_url`, `bio`, `address_name`, `location`, `verified_region`, `usage_purpose`, `onboarding_progress`, `activity_times`, `preferred_radius_km`, `created_at`, `updated_at`
- 상태: types에 정의됨, used (guardian/user profile enrichment)

---

## 2026-03-07 — Auto-Documented: matches

Dawn Sweep S1 자동 등록. 상세 변경 이력은 추후 보완 필요.

### 테이블 구조
- 테이블: `matches`
- 주요 컬럼: `from_guardian_id`, `to_guardian_id`, `status`, `relation_purpose`, `liked_section`, `comment`, `intro_message`, `compatibility_score`, `created_at`, `updated_at`
- 상태: types에 정의됨, used (matching result snapshots)

---

## 2026-03-07 — Auto-Documented: notification_settings

Dawn Sweep S1 자동 등록. 상세 변경 이력은 추후 보완 필요.

### 테이블 구조
- 테이블: `notification_settings`
- 주요 컬럼: `user_id`, `marketing_opt_in`, `chat_opt_in`, `schedule_opt_in`, `danglog_opt_in`, `push_opt_in`, `updated_at`
- 상태: types에 정의됨, used (user notification preferences)

---

## 2026-03-07 — Auto-Documented: partner_places

Dawn Sweep S1 자동 등록. 상세 변경 이력은 추후 보완 필요.

### 테이블 구조
- 테이블: `partner_places`
- 주요 컬럼: `name`, `category`, `address_name`, `location`, `description`, `photo_urls`, `business_hours`, `is_verified`, `amenities`, `created_at`, `updated_at`
- 상태: types에 정의됨, used (B2B location registry)

---

## 2026-03-07 — Auto-Documented: reports

Dawn Sweep S1 자동 등록. 상세 변경 이력은 추후 보완 필요.

### 테이블 구조
- 테이블: `reports`
- 주요 컬럼: `reporter_id`, `target_guardian_id`, `reason_category`, `content`, `evidence_urls`, `status`, `admin_memo`, `created_at`
- 상태: types에 정의됨, unused (user report/moderation table)

---

## 2026-03-07 — Auto-Documented: reservations

Dawn Sweep S1 자동 등록. 상세 변경 이력은 추후 보완 필요.

### 테이블 구조
- 테이블: `reservations`
- 주요 컬럼: `place_id`, `guardian_id`, `dog_id`, `reserved_at`, `status`, `guest_count`, `request_memo`, `created_at`
- 상태: types에 정의됨, used (B2B reservation pipeline)

---

## 2026-03-07 — Auto-Documented: reviews

Dawn Sweep S1 자동 등록. 상세 변경 이력은 추후 보완 필요.

### 테이블 구조
- 테이블: `reviews`
- 주요 컬럼: `author_id`, `target_id`, `schedule_id`, `rating`, `content`, `tags`, `created_at`
- 상태: types에 정의됨, used (peer review records)

---

## 2026-03-07 — Auto-Documented: schedule_participants

Dawn Sweep S1 자동 등록. 상세 변경 이력은 추후 보완 필요.

### 테이블 구조
- 테이블: `schedule_participants`
- 주요 컬럼: `schedule_id`, `guardian_id`, `dog_id`, `status`, `joined_at`
- 상태: types에 정의됨, used (multi-user schedule mapping)

---

## 2026-03-07 — Auto-Documented: users

Dawn Sweep S1 자동 등록. 상세 변경 이력은 추후 보완 필요.

### 테이블 구조
- 테이블: `users`
- 주요 컬럼: `id`, `email`, `phone`, `role`, `trust_score`, `trust_level`, `created_at`, `updated_at`
- 상태: types에 정의됨, used (core user/auth table)

---

## 2026-03-07 — Auto-Documented: walk_records

Dawn Sweep S1 자동 등록. 상세 변경 이력은 추후 보완 필요.

### 테이블 구조
- 테이블: `walk_records`
- 주요 컬럼: `schedule_id`, `author_id`, `partner_guardian_id`, `walk_date`, `walk_time`, `place_name`, `memo`, `photo_urls`, `visibility`, `created_at`, `updated_at`
- 상태: types에 정의됨, used (walk session records)

---

# Schema Changelog

## 2026-03-04 — Remote Supabase Apply & Runtime Fix (MCP)

원격 프로젝트(`fjpvtivpulreulfxmxfe`)에 매칭/위치 RPC를 재적용하고 런타임 스모크를 통해 의존 스키마 누락을 즉시 복구함.

### Remote Apply (Management API)
- `20260304090001_matching_logic_v2.sql` 원격 적용 완료 (`match_guardians_v2` 재설치).
- `20260304100001_set_guardian_location_rpc.sql` 원격 적용 완료 (`set_guardian_location` 재설치).

### Runtime Issue Detected
- `match_guardians_v2` 스모크 호출 시 `deleted_at` 컬럼 누락(`SQLSTATE 42703`) 확인.
- 원인: Phase 2 함수는 `guardians.deleted_at`, `guardians.visibility_level` 컬럼 의존, 원격 스키마는 일부 미적용 상태.

### Dependency Fix
- `20260304090000_schema_high_fidelity_phase1.sql` 원격 적용으로 의존 컬럼(`deleted_at`, `visibility_level`) 생성 및 정책 정렬.

### Verification
- 함수 존재 확인: `public.match_guardians_v2`, `public.set_guardian_location`.
- `match_guardians_v2` 스모크 호출 정상 응답(에러 없음, 결과 0건).
- `set_guardian_location` 권한 가드 확인: 비소유자 호출 시 권한 예외 발생.

---

## 2026-03-04 — Review Hardening Patch (Stability/RLS/Matching)

리뷰 피드백 기반으로 High Fidelity 3단계 마이그레이션을 안정화하는 보강 패치를 반영함.

### Phase 1 Hardening
- **auth_sync_trigger 안정화**: `handle_new_user`에서 이메일/전화 fallback 처리 및 예외 fail-open(`RAISE WARNING`) 적용.
- **set_guardian_location RPC 신설**: 위경도 좌표를 PostGIS `POINT` 형식으로 안전하게 저장하는 전용 함수 추가 (보안: `auth.uid()` 소유권 체크 포함).
- **RLS 연계 보강**: `guardians`, `dogs` 조회 정책에 `deleted_at` + `visibility_level` 조건 반영.
- **Spatial Index 보강**: `guardians.location` GIST 인덱스 추가 (`ST_DWithin` 탐색 성능 보강).
- **신규 테이블 보호**: `verified_regions`, `trust_score_history`에 RLS 및 정책 추가.

### Phase 2 Hardening
- **match_guardians_v2 재정의**: JSONB 기반 `activity_times`를 안전하게 처리하도록 `time_slot_overlap_count` 함수 도입.
- **모드 필터 활성화**: `p_mode`가 SQL 레벨에서 실제 필터로 동작하도록 반영.
- **문법/실행 안정성**: 함수 구조 정비 및 반환 컬럼(`target_guardian_id`) 고정.

### Phase 3 Hardening
- **RLS 정책 추가**: `dog_ownership`, `schedule_participants`, `partner_places`, `reservations`, `reports` 전체 RLS 활성화 및 정책 작성.
- **운영 인덱스 보강**: 소유권/참여자/예약/신고 조회 인덱스 추가.
- **수정 트리거 추가**: `partner_places`에 `updated_at` 트리거 적용.

### Frontend Sync
- **useMatch 연동 업데이트**: `match_guardians_v2` RPC 시그니처(`p_mode`, `target_guardian_id`)에 맞춰 훅 동기화.

---

## 2026-03-04 — High Fidelity Schema Upgrade (Wave 3 Foundation)

당앱의 확장성과 안정성을 위해 기존 스키마를 대폭 고도화하는 3단계 마이그레이션을 수행함.

### Phase 1: Auth Sync & Profile Enrichment
- **auth_sync_trigger**: `auth.users` 가입 시 `public.users` 자동 생성 트리거 추가 (초기 매너 온도 36.5도 설정).
- **profile_visibility**: 보호자 프로필 공개 범위 제어 (`all`, `neighbors`, `friends`, `private`) 추가.
- **verified_regions**: 다중 지역 인증 및 인증 이력 추적 테이블 신설.
- **soft_delete**: `guardians`, `dogs` 테이블에 `deleted_at` 컬럼 도입.

### Phase 2: Advanced Matching Logic (v2)
- **array_overlap_count**: 두 배열 간의 교집합 개수를 반환하는 유틸리티 함수 추가.
- **match_guardians_v2**: 거리(40%) + 시간대 겹침(30%) + 신뢰도(20%) + 다양성(10%) 가중치 기반의 2세대 매칭 RPC 구현.
- **visibility_filter**: 비공개 프로필 및 삭제 유저를 매칭 결과에서 자동 제외.

### Phase 3: Social & B2B Foundation
- **dog_ownership**: 반려견-보호자 N:M 관계 지원 (가족 계정 및 공동 관리 기능 기반).
- **schedule_participants**: 한 약속에 여러 명의 보호자와 반려견이 참여할 수 있는 다대다 일정 구조 구축.
- **partner_places / reservations**: B2B 장소(카페/병원 등) 정보 및 예약 파이프라인 테이블 신설.
- **reports**: 유저 신고 및 관리 시스템 구축.

---

## 2026-03-03 — Dawn Sweep 미등재 테이블 보완


Per SCHEMA-DRIFT-REPORT (2026-03-03), 15 tables exist in `database.types.ts` but were not
individually documented. Entries added below for traceability.

### blocks
- Purpose: 특정 보호자 간 상호 차단 관리
- Key columns: `blocker_id`, `blocked_id`, `created_at`
- Status: Wave 1 baseline

### care_requests
- Purpose: 돌봄 요청 (산책·돌봄·미용·병원)
- Key columns: `requester_id`, `caregiver_id`, `dog_id`, `care_type`, `status (pending/accepted/completed/cancelled)`, `datetime`, `duration_hours`
- Status: Wave 1 — DANG-B2B-001

### chat_messages
- Purpose: 채팅방 개별 메시지
- Key columns: `room_id`, `sender_id`, `content`, `read_at`
- Status: Wave 1 — DANG-CHT-001

### chat_participants
- Purpose: 채팅방 참여자 매핑
- Key columns: `room_id`, `user_id`, `joined_at`
- Status: Wave 1 — DANG-CHT-001

### chat_rooms
- Purpose: 매칭 또는 그룹 채팅 컨테이너
- Key columns: `type (direct/group)`, `last_message_at`
- Status: Wave 1 — DANG-CHT-001

### danglog_comments
- Purpose: 댕로그 게시물 댓글
- Key columns: `danglog_id`, `author_id`, `content`, `created_at`
- Status: Wave 1 — DANG-WLK-001 / DANG-DLG-001

### danglog_invites
- Purpose: 공동기록 초대 (생성/수락/거절)
- Key columns: `danglog_id`, `inviter_id`, `invitee_id`, `status`
- Status: Wave 1 — DANG-DLG-001

### danglog_likes
- Purpose: 댕로그 좋아요 토글
- Key columns: `danglog_id`, `guardian_id`
- Status: Wave 1 — DANG-DLG-001

### family_groups
- Purpose: 패밀리 모드 그룹 컨테이너
- Key columns: `name`, `creator_id`, `dog_ids (text[])`
- Status: Wave 1 — DANG-MAT-001

### family_members
- Purpose: 패밀리 그룹 멤버 매핑
- Key columns: `group_id`, `member_id`, `role (owner/member)`, `joined_at`
- Status: Wave 1 — DANG-MAT-001

### mode_unlocks
- Purpose: 모드 잠금해제 이력 (Basic / Care / Family)
- Key columns: `guardian_id`, `mode`, `unlocked_at`
- Status: Wave 1 — DANG-MAT-001

### notifications
- Purpose: 인앱 알림 수신함
- Key columns: `recipient_id`, `type`, `payload (jsonb)`, `read_at`
- Status: Wave 1 (UI binding pending)

### schedules
- Purpose: 산책·돌봄 일정 예약
- Key columns: `guardian_id`, `dog_id`, `scheduled_at`, `duration_minutes`, `type`
- Status: Wave 1 — DANG-MAT-001

### trust_badges
- Purpose: 신뢰 뱃지 획득 이력 (신분증·예방접종·리뷰 등)
- Key columns: `guardian_id`, `badge_type`, `verified_at`
- Status: Wave 1 — DANG-PRF-001

### walk_reviews
- Purpose: 산책 후 상호 평가 리뷰
- Key columns: `walk_id`, `reviewer_id`, `reviewee_id`, `rating`, `comment`
- Status: Wave 1 — DANG-WLK-001

---

## 2026-03-02

- Added Wave 1 schema expansion migration for onboarding, matching request metadata, walk records/reviews, collaborative danglog, notification settings, and consent logs.
- Added companion storage migration for dog/profile/walk/danglog buckets and object policies.
- Added baseline core RLS migration for existing public tables used by the web app.

---

## 2026-03-06 - Schema Drift Follow-up (Documentation + Usage Classification)

This update closes drift-report documentation gaps and clarifies table usage status for current app scope.

### Newly documented tables
- `matches`
  - Purpose: Like/pass/mutual-match relationship tracking between guardians.
  - Current usage: Active in matching flow (`/home`).
- `reviews`
  - Purpose: User-level review aggregates and profile trust surface.
  - Current usage: Active in profile/review flow.
- `walk_records`
  - Purpose: Walk execution evidence and post-schedule activity logs.
  - Current usage: Active in walk record flow.

### Unused table classification (current cycle)
- Candidate for active usage (B2B rollout): `partner_places`, `reservations`, `dog_ownership`, `schedule_participants`
- Candidate for deferred scope review: `blocks`, `notifications`, `reports`

### Notes
- This is a documentation/state-classification update only.
- No schema migration was applied in this step.

---

## 2026-03-06 - Chat RLS Recursion Hotfix + Schedule Message Backfill

### Problem
- `GET /rest/v1/chat_messages` returned `500` with `42P17` (`infinite recursion detected in policy for relation "chat_participants"`).
- Legacy schedule chat cards had no `metadata.scheduleId`, so accept/reject actions could not map to a concrete `schedules` row.

### Migration: `20260306194000_fix_chat_rls_recursion.sql`
- Added `public.is_room_participant(p_room_id uuid)` (`SECURITY DEFINER`, `STABLE`).
- Replaced select policies to use helper function:
  - `app_chat_rooms_select_participant_v1`
  - `app_chat_participants_select_participant_v1`
  - `app_chat_messages_select_participant_v1`
- Result: recursive policy evaluation path removed.

### Migration: `20260306195500_backfill_schedule_message_ids.sql`
- Backfilled `chat_messages(type='schedule')` where `metadata.scheduleId` was missing.
- Matching rule: `room_id + datetime(date/time metadata) + organizer/sender + location` against `schedules`.
- If no matching schedule exists, creates a proposed schedule row and writes created `id` back to message metadata.
- Result: historical schedule cards become actionable for response flow.

### Verification
- `chat_messages` room query that previously failed now returns `200`.
- Missing `scheduleId` count reduced from `12` to `0`.
- No schema shape change for client types; this is policy/runtime behavior stabilization.
