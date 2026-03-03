# Daily Log: Onboarding & Auth UI/UX Refinement

- **Date:** 2026-03-03
- **Status:** Completed (Phase 2-6 + Refactoring)
- **Parity IDs:** DANG-ONB-001, DANG-AUTH-001, DANG-DES-001

## 🎯 추가 작업 목표
1. 로그인 페이지를 간편 인증 중심으로 리팩토링하고 브랜드 아이덴티티(댕게팅) 강화.
2. 휴대폰 본인 인증 단계를 추가하여 서비스 신뢰도 확보.
3. 모든 페이지에서 접근 가능한 디버깅 네비게이터 구축.

## 🛠 상세 작업 내역

### 1. 로그인 페이지 리팩토링 (Auth Refactor)
- **간편 로그인:** 이메일 폼을 제거하고 구글/카카오 버튼 중심 UI로 개편.
- **로고 통합:** 외부 공식 로고(`logo.svg`)를 적용하고 중복 텍스트 로고 제거.
- **UX 조절:** 카카오 버튼의 채도를 미세하게 낮추어 눈의 피로도 감소 및 세련된 톤 구현.

### 2. 휴대폰 본인 인증 추가 (Phase 6)
- **스텝 확장:** 온보딩을 7단계에서 8단계로 확장.
- **새로운 단계:** Step 6에 `StepPhoneAuth.tsx`를 배치 (사진 등록 후, 지역 설정 전).
- **기능:** 3분 타이머, 인증번호 입력 UI, 디버깅용 건너뛰기 로직 포함.

### 3. 디버깅 인프라 및 전역 UI
- **DebugNavigator:** 화면 우측 하단 🛠️ 버튼을 통해 모든 라우트로 즉시 이동 기능 구현.
- **AppShell 통합:** RootLayout에서 모든 페이지를 AppShell로 감싸 디버그 버튼과 헤더 로고가 어디서든 보이도록 함.
- **헤더 로고:** 메인 서비스 상단 헤더의 텍스트를 공식 이미지 로고로 교체.

### 4. 온보딩 디버깅 모드 (Force Next)
- **유효성 우회:** Step 1, 2, 6 등 필수 입력 단계에서 유효성 검사 없이 이동 가능한 `handleForceNext` 로직 적용.
- **API 유연화:** 개발 환경에서는 Supabase 인증 에러가 발생해도 `/home`으로 강제 이동되도록 처리.

## 📂 업데이트된 주요 파일
- `frontend/src/app/(auth)/login/page.tsx` (리팩토링)
- `frontend/src/app/(auth)/onboarding/page.tsx` (스텝 추가)
- `frontend/src/components/features/onboarding/StepPhoneAuth.tsx` (신규)
- `frontend/src/components/ui/DebugNavigator.tsx` (신규)
- `frontend/src/components/shared/AppShell.tsx` (구조 개선)
- `frontend/src/stores/useOnboardingStore.ts` (로직 보완)

## ✅ 검증 결과
- 모든 페이지에서 `DebugNavigator` 정상 작동 확인.
- 8단계 완료 후 인증 에러와 상관없이 `/home` 진입 가능 확인.
- `npx tsc` 타입 체크 통과.

## 🚀 다음 권장 작업
1. **DANG-MAT-001:** `/home` 탭의 실제 데이터 연동 및 매칭 알고리즘 설계.
2. **DANG-CHT-001:** 채팅방 상세 페이지 구현 및 실시간 메시지 연동.
