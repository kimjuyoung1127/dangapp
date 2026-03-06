# Daily Log: High Fidelity Schema Enhancement & Wave 3 Preparation

- **Date:** 2026-03-04
- **Status:** Completed (Schema Enhancement Phase 1-3 + Review Hardening Patch)
- **Parity IDs:** DANG-INFRA-001, DANG-MAT-001, DANG-B2B-001

## 🎯 작업 목표
1. Supabase MCP 및 Management API를 통한 현재 DB 스키마 정밀 진단.
2. 온보딩 및 매칭 시스템의 결함(Auth Sync, Location Data 등) 해결을 위한 스키마 고도화.
3. 미래 확장성(가족 계정, B2B 파트너)을 고려한 데이터 구조 선제적 구축.

## 🛠 상세 작업 내역

### 1. DB 정밀 진단 및 샘플 데이터 적재
- **인증 확보:** Supabase Management API를 통해 `anon`, `service_role` 키를 확보하여 DB 직접 제어권 획득.
- **데이터 유실 확인:** 기존 `guardians`, `dogs` 테이블이 비어있음을 확인하고, 매칭 테스트를 위한 샘플 데이터(가디언 1명, 반려견 2마리)를 실제 `auth.users` ID와 연동하여 적재 성공.

### 2. 스키마 고도화 (Phase 1-3 Migrations)
- **Phase 1 (인증/프로필):** 
    - `auth.users` -> `public.users` 자동 동기화 트리거 구현 (온보딩 FK 에러 원천 차단).
    - 프로필 공개 범위(`visibility_level`) 및 소프트 딜리트(`deleted_at`) 도입.
- **Phase 2 (매칭 로직):**
    - 2세대 매칭 RPC `match_guardians_v2` 구현 (거리 + 시간대 겹침 + 신뢰도 합산 스코어링).
    - 시간대 교집합 계산을 위한 `array_overlap_count` 유틸리티 함수 추가.
- **Phase 3 (소셜/B2B):**
    - `dog_ownership` 테이블 신설로 가족 계정 및 N:M 관리 구조 지원.
    - `partner_places`, `reservations` 테이블로 B2B 예약 시스템 기초 마련.
    - 유저 신고(`reports`) 시스템 구축.

### 3. 문서 현황 업데이트
- `SCHEMA-CHANGELOG.md`: 고도화 내역 상세 기록.
- `PROJECT-STATUS.md`: Wave 1 완료 및 MCP 블로커 해제 반영.

### 4. 리뷰 보강 및 긴급 패치 반영 (Review Hardening & Emergency Fix)
- **[Resolved - Critical] 위치 인증 실동작 보장:** 
    - `Step6Location.tsx`: `handleVerifyLocation` 핸들러를 버튼에 바인딩하고 `type="submit"`으로 폼 유효성 검사 로직을 복구함.
- **[Resolved - Critical] RPC 보안 강화:**
    - `set_guardian_location`: `SECURITY DEFINER` 함수 내부에서 `auth.uid()`와 가디언 소유자를 대조하는 체크 로직을 추가하여 타인 위치 조작 원천 차단.
- **[Resolved - Critical] 온보딩-매칭 데이터 단절 해소:**
    - `mappers.ts`: 수집된 좌표를 PostGIS `POINT(lng lat)` 형식으로 변환하여 `guardians.location` 필드에 저장하도록 매퍼 고도화.
    - `activity_times`: 매칭 RPC(`v2`) 규격에 맞춰 평일/주말 시간대를 단일 배열로 병합 및 규격화.
- **[Resolved - High] 기존 유저 백필 (Backfill):**
    - 트리거 설치 전 가입한 기존 유저(`gmdqn2tp@gmail.com`)를 `public.users`로 복사하는 수동 SQL 스크립트 실행 완료.
- **[High] 프론트엔드 연동 기초:**
    - `useMatch.ts`: 신규 RPC `match_guardians_v2` 호출 및 응답 스키마(`target_guardian_id`) 대응 완료.
    - `useOnboardingStore.ts`: 위경도 좌표 저장을 위한 신규 상태 필드 추가.

### 5. 원격 Supabase 즉시 반영 및 런타임 복구 (MCP/Management API)
- **함수 재배포 완료:**
    - `20260304090001_matching_logic_v2.sql` 원격 적용 (`match_guardians_v2` 재설치).
    - `20260304100001_set_guardian_location_rpc.sql` 원격 적용 (`set_guardian_location` 재설치).
- **스모크 중 의존 누락 탐지 및 복구:**
    - `match_guardians_v2` 호출에서 `deleted_at` 컬럼 누락 오류(`SQLSTATE 42703`) 확인.
    - 의존 마이그레이션 `20260304090000_schema_high_fidelity_phase1.sql` 원격 적용으로 `guardians.deleted_at`, `guardians.visibility_level` 복구.
- **최종 검증:**
    - 함수 존재 확인: `match_guardians_v2`, `set_guardian_location`.
    - `match_guardians_v2` 스모크 호출 성공(에러 없음).
    - `set_guardian_location` 권한 가드 동작 확인(비소유자 호출 시 권한 예외).

## ✅ 검증 결과
- **Auth Sync:** 트리거 로직 검증 완료.
- **Matching RPC:** SQL 레벨에서 가중치 기반 정렬 로직 정상 작동 확인 + 원격 런타임 에러 해소.
- **Data Integrity:** `public.users` 테이블과 `auth.users` 간의 연결 고리 확보.
- **Production Readiness (DB):** `match_guardians_v2` / `set_guardian_location` 원격 함수 및 의존 컬럼 정합성 확인.

## 🚀 다음 권장 작업
1. **Onboarding Atomic RPC:** `guardians upsert + location + dogs insert`를 단일 트랜잭션 RPC로 통합.
2. **/modes + Family UI:** `dog_ownership` 기반 가족 초대/관리 UX 및 `/modes` 라우트 플로우 구현/검증.
3. **E2E 검증:** `/home` 매칭 카드 점수 노출과 실제 RPC 응답 정합성(end-to-end) 검증.
