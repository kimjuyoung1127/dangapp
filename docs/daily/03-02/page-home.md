# /home — DANG-MAT-001 구현 로그 (2026-03-02)

## Scope
DANG-MAT-001, DANG-DES-001

## 변경 파일

| 액션 | 파일 | 설명 |
|------|------|------|
| CREATE | `frontend/src/lib/hooks/useCurrentGuardian.ts` | 현재 guardian + dogs 프로필 조회 훅 |
| REWRITE | `frontend/src/lib/hooks/useMatch.ts` | guardianId/mode 파라미터, 상호 매칭 감지, queryClient invalidation |
| CREATE | `frontend/src/components/features/match/types.ts` | MatchGuardianProfile, DogProfile 타입 |
| REWRITE | `frontend/src/components/features/match/MatchCard.tsx` | 더미 데이터 제거, MatchGuardianProfile 바인딩 |
| CREATE | `frontend/src/components/features/match/MatchEmptyState.tsx` | 빈 상태 컴포넌트 |
| CREATE | `frontend/src/components/features/match/IncompleteProfileBanner.tsx` | 프로필 완성 유도 배너 |
| CREATE | `frontend/src/components/features/match/MutualMatchModal.tsx` | 상호 매칭 축하 모달 |
| REWRITE | `frontend/src/app/(main)/home/page.tsx` | 전면 리라이트 — Supabase 바인딩 + 모드 필터 + Like/Pass |
| MODIFY | `frontend/src/lib/utils.ts` | formatDistance 유틸 추가 |

## 검증

- `npx tsc --noEmit`: 타입 에러 0
- `npx next lint`: ESLint 에러 0
- `npm run build`: 빌드 성공 (/home 8.44kB)

## 주요 구현 사항

1. **useCurrentGuardian**: auth.getUser() → guardians.select("*, dogs(*)") 패턴
2. **useMatchingGuardians**: guardianId/mode 파라미터 + 클라이언트 사이드 usage_purpose 필터
3. **useCreateMatchAction**: 상호 매칭 감지 (reverse match 확인 → 양방향 accepted 업데이트)
4. **MatchCard**: 더미 데이터 완전 제거, bio + temperament 카드 교체
5. **home/page.tsx**: currentIndex 기반 카드 네비게이션 + MutualMatchModal

## 리스크

- `match_guardians` RPC mode 필터 미지원 → 클라이언트 사이드 필터로 대응 완료
- placeholder 이미지 (`/placeholder-dog.png`) 파일 필요 — 아직 없으면 추가 필요
- 상호 매칭 race condition → single() 쿼리 + 순차 업데이트로 처리

## Status
InProgress → QA
