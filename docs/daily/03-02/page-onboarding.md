# /onboarding — 2026-03-02

## DANG-INFRA-001 + DANG-ONB-001

### 완료 항목

**INFRA-001: Supabase 마이그레이션 적용**
- 6개 마이그레이션 순서대로 적용 완료
  - initial_schema (16 base tables)
  - matching_rpc
  - care_family_tables
  - wave1_schema_foundation (6 new tables + column expansions)
  - core_rls_baseline (65 RLS policies)
  - wave1_storage_policies (4 buckets)
- 검증: 29개 테이블, 4개 스토리지 버킷, 65개 RLS 정책 확인

**ONB-001: 프로그레시브 온보딩 리빌드**
- 필수 3필드: nickname, dog_name, address_name
- 나머지 전부 "(선택)" 라벨 + 버튼 항상 활성화
- RHF + Zod 검증 연결 (Step1, Step2, Step6)
- ToggleChip CVA 컴포넌트 (인라인 className 조건 제거)
- PageSlide MotionWrapper 추가
- useOnboarding.ts Supabase 훅 (영속화 + 사진 업로드)
- Step5 실제 파일 업로드 + Skeleton 로딩
- Step7 최종 제출 → guardian + dog + consent_logs INSERT
- 기존 가디언 리다이렉트 (onboarding/page.tsx)

### 검증 결과
- `npx tsc --noEmit`: 0 errors
- `npx next lint`: 0 warnings/errors
- `npm run build`: 성공 (14 routes)

### Status
InProgress → QA
