# /schedules — 2026-03-03

## Parity ID
DANG-WLK-001

## Status
✅ Complete — 실데이터 바인딩 + 산책기록/후기 작성

## Changes
| Action | File |
|--------|------|
| CREATE | `frontend/src/lib/hooks/useSchedule.ts` |
| CREATE | `frontend/src/lib/hooks/useWalkRecord.ts` |
| CREATE | `frontend/src/lib/hooks/useWalkReview.ts` |
| CREATE | `frontend/src/components/features/walk/CLAUDE.md` |
| CREATE | `frontend/src/components/features/walk/WalkRecordForm.tsx` |
| MODIFY | `frontend/src/app/(main)/schedules/page.tsx` |

## What Changed
- **mock 데이터 완전 제거**: dummySchedules, useState(isLoading)+setTimeout 삭제
- **실데이터 바인딩**: useCurrentGuardian() → useMySchedules(guardianId) 연결
- **약속 필터**: proposed+confirmed → "예정", completed → "완료", cancelled → "취소됨"
- **산책 기록 작성**: WalkRecordForm BottomSheet (RHF+Zod, 이미지 업로드, walk-records 버킷)
- **후기 작성 연동**: ReviewForm에 실 guardianId/partnerGuardianId 바인딩
- **완료 탭 액션**: "산책 기록" + "후기 작성" 2버튼 추가

## Validation
- `npx tsc --noEmit`: 0 errors
- `npx next lint`: 0 errors/warnings

## Risks
- schedules 테이블 participant_ids 배열 기반 조회 → contains 연산자 사용 (대량 데이터 시 성능)
- walk-records 버킷 미생성 시 업로드 실패 → Wave 1에서 생성 완료
