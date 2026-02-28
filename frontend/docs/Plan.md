# 댕게팅 (DangGeting) 웹앱 구현 플랜

## 기획 및 디자인 설정 (Planning)
- [x] 초기 기획, 기술 스택, DB 아키텍처 수립
- [x] 상세 디자인 플랜 수립 (Typography, Color, Layout, Animation)
  - [x] Hinge / Bumble 레퍼런스 분석 및 UX 맵핑
  - [x] 사용자 디자인 플랜 리뷰

## 개발 초기 설정 (Setup)
- [x] `CLAUDE.md` 생성 및 글로벌 룰/스킬셋 명시 (`.claude/skills` 분리 완비)

## Phase 0: DB 스키마 설계
- [x] Supabase 마이그레이션 - `users`, `guardians` 테이블 작성
- [x] Supabase 마이그레이션 - `dogs` 테이블 작성
- [x] Supabase 마이그레이션 - `matches`, `blocks` 테이블 작성
- [x] Supabase 마이그레이션 - `chat_rooms`, `chat_messages` 테이블 작성
- [x] Supabase 마이그레이션 - `schedules`, `danglogs`, `danglog_comments` 작성
- [x] Supabase 마이그레이션 - `reviews`, `trust_badges`, `notifications`, `mode_unlocks` 작성
- [x] RLS(Row Level Security) 정책 정의 및 적용
- [x] TypeScript Database 타입 정의 (`src/types/database.types.ts`)
- [x] `.env.example` 작성

## Phase 1: 스캐폴딩 + 인증 + 온보딩
- [x] Next.js (App Router) 14.2 환경 설정 및 랜딩 디자인 토큰 이식
- [x] 전역 상태(Zustand) 및 TanStack Query 세팅
- [x] 공통 UI 프리미티브 컴포넌트 개발 (CVA + clsx + tailwind-merge)
- [x] Supabase 간편인증 (Magic Link / OTP) 미들웨어 및 기능 구현
- [x] 7단계 온보딩 플로우 구현 (진행률 바, 모션 적용)
- [ ] 카카오 OAuth 연동 (추후 진행)

## Phase 2: 홈 피드 + 매칭 시스템 (Hinge 스타일)
- [x] 추천 보호자 카드 UI 및 수직 스크롤 프로필 구현
- [x] 특정 섹션별(사진, 답변 등) 좋아요/코멘트 마이크로 인터랙션 달기
- [x] Supabase RPC를 통한 매칭 알고리즘 구현 (거리, 활동시간, 성향 가중치)
- [x] 차단 제외 및 필터링 적용 처리

## Phase 3: 채팅 + 약속
- [x] Supabase Realtime을 이용한 1:1 채팅방 UI/로직 구현
- [x] 약속 제안/수락 UI (스케줄 카드 메시지 타입) 기능
- [x] 예정/완료/취소 약속 관리 페이지 및 플로우 개발

## Phase 4: 댕로그
- [x] 이미지 업로드(Supabase Storage) 폼 및 작성 에디터 구현
- [x] 피드(내 기록 + 공유) 및 뷰어 컴포넌트 개발
- [x] 댓글 (Comment) 및 좋아요 토글 애니메이션 기능 추가

## Phase 5: 후기 + 신뢰 시스템 (Bumble 스타일)
- [x] 약속 완료 후기(모달 폼), 별점, 태그 기능
- [x] 신뢰 점수(Trust Score) 계산 알고리즘 및 점수 배지 표시(ProfileCard)
- [x] 레벨별 뱃지 시스템 도입 (TrustBadge)

## Phase 6: 모드 확장 (Care + Family)
- [x] 신뢰 레벨에 따른 Care Mode 잠금 해제 인터페이스
- [x] 돌봄 요청/수락 기능 구성
- [x] Family Mode 및 그룹 생성/공동 일정 접근 제어 처리

## Phase 7: PWA + 배포 최적화
- [x] PWA manifest 및 Service Worker 캐싱 처리
- [x] 이미지 최적화 및 Lighthouse 성능(Core Web Vitals) 테스트
- [x] Vercel 배포 및 최종 CI/CD(GitHub Actions) 검증

## Phase 8: UI/UX Polishing & Design Consistency
- [x] 글로벌 스타일 보강 (Reduced Motion, Focus Ring, sr-only)
- [x] 디자인 토큰 확장 및 일관성 적용 (Color, Border-Radius)
- [x] 접근성(A11y) 개선 (ARIA labels, Semantic HTML)
- [x] 로딩 및 빈 상태 UI 구현 (Skeletons, Empty Feed)
- [x] 에러 바운더리 및 예외 처리 구현
- [x] 최종 빌드 및 디자인 시스템 검증
