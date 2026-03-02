# /danglog — 2026-03-03

## Parity ID
DANG-DLG-001

## Status
✅ Complete — 실데이터 바인딩 + 협업 훅 + 공유 모달

## Changes
| Action | File |
|--------|------|
| MODIFY | `frontend/src/lib/hooks/useDangLog.ts` |
| CREATE | `frontend/src/components/features/danglog/ShareModal.tsx` |
| CREATE | `frontend/src/components/features/danglog/DangLogEmptyState.tsx` |
| MODIFY | `frontend/src/app/(main)/danglog/page.tsx` |
| MODIFY | `frontend/src/app/(main)/danglog/[id]/page.tsx` |

## What Changed
- **useDangLog.ts 확장**: useDangLogCounts, useDangLogCollaborators, useInviteCollaborator, useAcceptInvite 추가
- **mock 데이터 완전 제거**: MOCK_GUARDIAN_ID, mockDangLogs, isInitialLoading+setTimeout, 하드코딩 "초코" 삭제
- **실데이터 바인딩**: useCurrentGuardian() → useDangLogs/useDangLogLikes/useDangLogCounts 연결
- **피드 페이지**: DangLogCardWithCounts 래퍼로 개별 like/comment count 쿼리
- **빈 상태**: DangLogEmptyState 컴포넌트 (아이콘+텍스트+작성 버튼)
- **상세 페이지**: 공유 버튼 + ShareModal(협업 초대+소셜 공유) + 협업자 아바타 표시
- **강아지 이름**: guardian.dogs[0].name 실 데이터

## Validation
- `npx tsc --noEmit`: 0 errors
- `npx next lint`: 0 errors/warnings

## Risks
- 피드에서 개별 danglog마다 like/comment count 쿼리 → N+1 (추후 RPC 집계 최적화)
- 초대 수락 flow: /danglog/invite/[token] 라우트 미구현 → 추후 추가 필요
