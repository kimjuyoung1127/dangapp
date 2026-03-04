# 인증 및 온보딩 엔드투엔드(E2E) 연동 리뷰 보고서 (DANG-AUTH-002)

## 1. 인증 콜백 안정성 (`auth/callback/route.ts`)
- **평가: 매우 우수함**
- **근거:** Next.js 14+ 앱 라우터(App Router) 표준에 맞춰 `@supabase/ssr`의 `createServerClient`를 올바르게 구현했습니다. `NextResponse.redirect` 객체를 먼저 생성하고, `set` 및 `remove` 메서드 안에서 해당 `response` 인스턴스에 직접 쿠키를 구워내는(Baking) 방식은 세션 교환 후 쿠키가 응답 헤더에 확실히 포함되게 하는 가장 안전한 패턴입니다.

## 2. 미들웨어 게이팅 로직 (`middleware.ts`)
- **평가: 견고함 (무한 루프 위험 낮음)**
- **근거:** `isMainApp`, `isAuthPage`, `isOnboardingPage` 등 경로 그룹을 철저히 분리하여 상태 머신처럼 관리하고 있습니다. 온보딩 진행률 체크 시 현재 경로가 타겟과 일치하지 않을 때만 리다이렉션을 발생시키므로 무한 루프(Redirect Loop) 방지 처리가 아주 잘 되어 있습니다.
  - `progress < 100`이며 `isMainApp` 접근 시에만 `/onboarding`으로.
  - `progress === 100`이며 `isOnboardingPage` 접근 시에만 `/home`으로.
- **보안 측면:** 세션 검증 시 `getSession` 대신 API 호출 비용이 들더라도 `getUser()`를 사용하여 탈취되거나 조작된 JWT 토큰 검증을 엄격하게 처리한 점도 훌륭합니다.

## 3. 데이터 정합성 및 외래키 연결 (`dogApi.ts`)
- **평가: 우수함 (단, 분산 트랜잭션 한계 존재)**
- **근거:** `guardians` 테이블에 `{ onConflict: 'user_id' }` 속성으로 `upsert`를 사용하여 신규/기존 유저를 유연하게 처리합니다. 업서트가 완료된 반환 객체의 `id`를 `dogs` 테이블의 `guardian_id` 외래키로 즉시 주입하므로 데이터 연결 관계는 완벽합니다.
- **개선 제안 (Minor):** 현재 두 번의 비동기 호출(`guardians` 업서트 -> `dogs` 인서트)로 이루어집니다. 만약 `guardians` 테이블은 성공하고 `dogs` 테이블 인서트에서 네트워크 에러 등이 발생하면 부분 적용(Partial State)이 될 수 있습니다. 운영 단계에서 RPC 통신(PostgreSQL Function)을 도입하면 완벽한 원자성(Atomicity)을 확보할 수 있습니다.

## 4. 데이터 조회 보안 및 에러 핸들링
- **평가: 권한 에러 없는 유연한 처리**
- **근거:** `middleware.ts`에서 유저 데이터를 조회할 때 `.single()` 대신 `.maybeSingle()`을 활용한 점이 인상적입니다. 신규 가입 직후라 `guardians` 로우가 아예 없더라도 쿼리가 500 에러나 Exception을 던지지 않고 `null`을 반환하므로, `progress = 0`으로 부드럽게 롤백(Fallback) 처리되는 효율성을 보여줍니다. 로그인 페이지의 소셜 로그인 또한 옵션으로 `/auth/callback`을 잘 향하고 있어 흐름이 자연스럽습니다.

---
**총평:** Next.js 14 서버 사이드 렌더링 환경에서의 Supabase Auth 연동 정석 가이드라인을 완벽에 가깝게 준수하고 있습니다. 프로덕션 레벨로 넘어가도 무방한 좋은 코드입니다.
