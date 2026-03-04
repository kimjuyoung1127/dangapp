# 03-05 /home 진단 수정 + B2B 진입 준비

## 완료 항목

### P0-1: chat_participants 500 에러 수정
- `create_chat_room_with_participants` SECURITY DEFINER RPC 생성
- `useGetOrCreateChatRoom` → RPC 호출로 교체
- Supabase 마이그레이션 적용 완료 (`20260305090000`)

### P0-2: 매칭 빈 결과 해결
- `MatchEmptyState`에 `reason` prop 추가 (`no-location` / `no-results`)
- `/home`에서 guardian.location 체크 후 분기 표시
- 테스트 가디언 위치 시딩 적용 (`20260305090001`)
- **근본 원인**: 시드 가디언 좌표가 댕대디와 8.8km 떨어져 반경 6km 초과
- 임시 디버그 RPC(`debug_match_check`)로 필터 분해 진단
- 시드 가디언 4명을 댕대디 근처 0.8~2.1km 반경 내로 재배치 (`20260305090003`)
- 디버그 RPC 정리 (`20260305090004`)
- **결과**: `match_guardians_v2` → 4명 정상 반환 확인

### P1-1: useChatRooms N+1 제거
- for 루프 → 배치 쿼리 + Promise.all (방 수 무관 고정 쿼리)

### P1-2: useMySchedules N+1 제거
- partner ID 수집 → `.in()` 배치 조회 (3개 고정 쿼리)

### P1-3: QueryClient 최적화
- `refetchOnWindowFocus: false`, `retry: 1` 추가

### P1-4: useCurrentGuardian staleTime
- 5분으로 증가 (4+ 페이지 공유, 프로필 변경 빈도 낮음)

### P2-1: 디버그 로그 제거
- `/home` console.log useEffect 블록 제거

### Supabase 마이그레이션 동기화
- CLI `migration repair` → 12개 기존 마이그레이션 `applied` 마킹
- Local = Remote 완전 동기화 완료

### B2B 진입 준비 (DANG-B2B-001)
- `database.types.ts` 누락 5개 테이블 타입 추가 (partner_places, reservations, reports, dog_ownership, schedule_participants)
- RPC Functions 타입 추가 (match_guardians_v2, create_chat_room_with_participants, set_guardian_location)
- Enums 6개 추가 (profile_visibility, place_category, reservation_status, report_status, dog_ownership_role, schedule_participant_status)
- PAGE-UPGRADE-BOARD: `/modes`, `/care`, `/family` owner를 claude로 claim

### 스킬 문서화
- `dang-rpc-diagnosis` ops 스킬 생성 (4개 섹션)
- SKILL-DOC-MATRIX에 Ops Skills 섹션 추가

## Validation
- `npx tsc --noEmit`: 통과
- `supabase migration list`: Local = Remote 동기화 완료 (16개)
- `npx next lint`: 이번 변경 관련 새 에러 없음
- `match_guardians_v2` REST 호출: 4명 정상 반환

## Next
1. `/modes` 페이지 mock → real 데이터 바인딩
2. `/care` 페이지 mock → real 데이터 바인딩
3. `/family` 페이지 mock → real 데이터 바인딩
