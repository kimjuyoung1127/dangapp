# /profile — 2026-03-03

## Parity ID
DANG-PRF-001

## Status
✅ Complete — 실데이터 바인딩 + 편집 시트 + 알림 설정 + 통계

## Changes
| Action | File |
|--------|------|
| MODIFY | `frontend/src/lib/hooks/useProfile.ts` |
| CREATE | `frontend/src/components/features/profile/EditProfileSheet.tsx` |
| CREATE | `frontend/src/components/features/profile/NotificationSettings.tsx` |
| MODIFY | `frontend/src/app/(main)/profile/page.tsx` |

## What Changed
- **useProfile.ts 확장**: useUpdateGuardian, useUpdateDog, useNotificationSettings, useUpdateNotificationSettings, useProfileStats 추가
- **mock 데이터 완전 제거**: MOCK_GUARDIAN_ID, MOCK_PROFILE, MOCK_BADGES, MOCK_STATS, isLoading=false 삭제
- **실데이터 바인딩**: useCurrentGuardian → useGuardianProfile/useTrustBadges/useProfileStats 연결
- **프로필 편집**: EditProfileSheet BottomSheet (보호자/반려견 2탭, RHF+Zod)
- **알림 설정**: NotificationSettings 토글 (5항목, UPSERT 패턴)
- **통계**: useProfileStats → 받은 후기 수 + 평균 별점 + 완료 약속 수 집계
- **Settings 버튼**: 헤더 우측 편집 진입점 추가

## Validation
- `npx tsc --noEmit`: 0 errors
- `npx next lint`: 0 errors/warnings

## Risks
- notification_settings 레코드 없을 시 기본값 반환 → UPSERT로 대응
- 통계 쿼리 3회 (reviews + schedules organizer + schedules participant) → 추후 RPC 최적화
