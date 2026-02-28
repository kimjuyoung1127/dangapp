# dangapp — CLAUDE.md

## 프로젝트
댕게팅(DangGeting) — 신뢰 기반 반려견 보호자 매칭 웹앱

## 필수 스킬 패턴 (물리적 스킬 저장소 연동)
각 스킬의 상세 원칙과 템플릿은 `.claude/skills/{이름}/SKILL.md`에 문서화되어 있습니다.
- SKILL-01: CVA Component Factory → [.claude/skills/dangapp-cva-factory/SKILL.md](.claude/skills/dangapp-cva-factory/SKILL.md)
- SKILL-02: cn() Merge Guard → [.claude/skills/dangapp-cva-factory/SKILL.md](.claude/skills/dangapp-cva-factory/SKILL.md)
- SKILL-03: Motion Wrapper Pattern → [.claude/skills/dangapp-motion-wrapper/SKILL.md](.claude/skills/dangapp-motion-wrapper/SKILL.md)
- SKILL-04: App Shell Layout → [.claude/skills/dangapp-app-shell/SKILL.md](.claude/skills/dangapp-app-shell/SKILL.md)
- SKILL-05: Supabase Data Hook → [.claude/skills/dangapp-supabase-hook/SKILL.md](.claude/skills/dangapp-supabase-hook/SKILL.md)
- SKILL-06: Skeleton Factory → [.claude/skills/dangapp-skeleton-factory/SKILL.md](.claude/skills/dangapp-skeleton-factory/SKILL.md)
- SKILL-07: Form Step Pattern → [.claude/skills/dangapp-form-step/SKILL.md](.claude/skills/dangapp-form-step/SKILL.md)
- SKILL-08: Trust Visual Pattern → [.claude/skills/dangapp-trust-visual/SKILL.md](.claude/skills/dangapp-trust-visual/SKILL.md)

## 코딩 컨벤션
- 모든 새 파일 최상단에 헤더 주석: `// 파일명 — 간단 설명`
- 새로 만드는 폴더에 `CLAUDE.md` 생성하여 폴더 역할/컨벤션 문서화

## 절대 금지
- 인라인 className 조건 분기 (CVA variant 사용)
- 컴포넌트에서 직접 supabase 호출 (hooks 경유)
- 로딩 스피너 (Skeleton 사용)
- 직접 motion 속성 (MotionWrappers 래퍼 사용)
- Inter/Roboto 등 지정 외 폰트
- rounded-lg, rounded-md (rounded-full/3xl/xl만 허용)

## 빌드 및 실행
모든 프론트엔드 작업은 `frontend` 디렉토리 내에서 수행합니다.
- 개발 서버: `cd frontend && npm run dev`
- 빌드: `cd frontend && npm run build`
- 린트: `cd frontend && npm run lint`

## 디자인 토큰 출처
`frontend/tailwind.config.ts` 참조.

## 기술 스택
Next.js 14.2 | TypeScript 5 strict | Tailwind 3.4 | Framer Motion 12
CVA + clsx + tailwind-merge | RHF + Zod | Zustand + TanStack Query
Supabase (Auth + DB + Realtime + Storage)
