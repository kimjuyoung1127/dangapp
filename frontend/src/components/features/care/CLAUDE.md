# care 컴포넌트

돌봄 모드 — 돌봄 요청/수락 기능.

- **CareRequestForm**: BottomSheet 돌봄 요청 작성 (유형+일시+설명)
- **CareTypeSelect**: 돌봄 유형 칩 선택 (ActivityTypeSelect 패턴)
- **CareRequestCard**: 요청 카드 (상태별 표시)
- **CareRequestList**: 요청 목록 (탭: 보낸/받은) + Skeleton
- **데이터**: `useMode.ts` 훅 경유
