# 코드 리뷰 보고서: 인증 흐름 및 온보딩 고도화 (DANG-AUTH-001)

인증 흐름 개편과 휴대폰 본인 인증 추가, 그리고 디버깅 인프라 결합 방식에 대한 리뷰 결과입니다.

## 📋 리뷰 요약
- **인증 흐름:** 소셜 로그인 이후 신규 유저를 온보딩으로 유도하는 흐름이 직관적입니다.
- **보안 및 신뢰:** 휴대폰 인증 UI에 타이머와 안내 문구를 도입하여 사용자 신뢰도를 높였습니다.
- **⚠️ 크리티컬 리스크:** `DebugNavigator`의 개발 모드 플래그 하드코딩과 온보딩 내 디버그 버튼이 프로덕션 환경에서 보안 위협이 될 수 있습니다.

## 🔍 중점 체크 포인트 답변

### 1. 인증 흐름의 논리성
- **LoginPage -> Onboarding -> Home** 흐름은 견고하게 설계되었습니다.
- [login/page.tsx:L16-22](file:///c:/Users/gmdqn/dangapp/frontend/src/app/(auth)/login/page.tsx#L16-22)의 유저 상태 분기 로직이 명확합니다. 실제 배포 시에는 API 응답값에 따른 실시간 처리가 필요합니다.

### 2. UI/UX 일관성 (TDS 준수)
- `/logo.svg`와 `ToggleChip`이 온보딩 전체에서 일관되게 사용되고 있습니다.
- `LoginPage`의 소셜 버튼들은 브랜드 컬러를 준수하면서도 `active:scale` 효과를 넣어 전반적인 인터렉션 톤앤매너를 맞추었습니다.

### 3. StepPhoneAuth 보안 및 신뢰
- **신뢰성:** 3분 타이머와 입력 필드 구성이 토스/카카오와 유사한 수준으로 구현되어 사용자에게 충분한 신뢰를 줍니다.
- **보안 리스크:** [StepPhoneAuth.tsx:L114-119](file:///c:/Users/gmdqn/dangapp/frontend/src/components/features/onboarding/StepPhoneAuth.tsx#L114-119)의 `인증 건너뛰기` 버튼은 디버깅용으로 매우 유용하나, **프로덕션 빌드에서 반드시 제거**되거나 조건부 렌더링 처리가 되어야 합니다.

### 4. 디버깅 인프라 (DebugNavigator)
- **결합 방식:** `AppShell` 최상단에 배치하여 어디서든 접근 가능한 방식은 전역적으로 유효합니다.
- **⚠️ 잠재적 위험 요소:** [DebugNavigator.tsx:L27](file:///c:/Users/gmdqn/dangapp/frontend/src/components/ui/DebugNavigator.tsx#L27)에 `const isDev = true;`가 하드코딩되어 있습니다. 이대로 배포될 경우 일반 사용자에게 모든 내부 경로(로그인, 온보딩, 프로필 등)가 노출되고 강제 이동이 가능해지는 **심각한 보안 취약점**이 됩니다. `process.env.NODE_ENV === 'development'`로 수정이 시급합니다.

## 💡 개선 제안
- **타입 안정성:** `useOnboardingStore`에 `phone_number`와 `is_phone_verified`가 성공적으로 추가되었습니다. `mappers.ts`의 [L51](file:///c:/Users/gmdqn/dangapp/frontend/src/lib/utils/mappers.ts#L51) 주석을 해제하여 DB 저장 로직을 마저 연결하는 것을 권장합니다.
- **비정상 종료 대응:** 온보딩 도중 브라우저를 닫았을 때, 다시 진입 시 `useOnboardingStore`의 상태가 복구될 수 있도록 로컬 스토리지 연동(Zustand `persist` 미들웨어 등)을 고려해볼 수 있습니다.

---
**리뷰 완료일:** 2026-03-03
**리뷰어:** Antigravity (Senior Full-stack Engineer)
