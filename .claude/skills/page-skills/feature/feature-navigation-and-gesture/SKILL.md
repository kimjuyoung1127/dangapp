---
name: feature-navigation-and-gesture
description: BottomSheet, 스와이프 제스처, 탭 접근성 패턴.
---

# feature-navigation-and-gesture

## Trigger
- BottomSheet, 스와이프, 탭 네비게이션, 제스처 구현 시

## Inputs
- 활성 라우트 및 대상 파일
- 관련 parity ID 및 현재 board 행

## Procedure
1. **BottomSheet** — SKILL-03 MotionWrapper의 BottomSheet 컴포넌트 사용. 직접 구현 금지.
2. **스와이프 제스처** — 카드 스와이프 (매칭), 목록 스와이프 (삭제/아카이브). framer-motion drag 기반.
3. **탭 접근성** — `role="tablist"`, `role="tab"`, `aria-selected` 적용. 키보드 네비게이션 지원.
4. **뒤로가기** — Next.js `router.back()` 또는 명시적 라우트. 딥링크 시 fallback 라우트.
5. **터치 타깃** — 모든 인터랙티브 요소 최소 44x44px. 스와이프 핸들 영역 명확.

## Gesture Pattern
```tsx
<motion.div
  drag="x"
  dragConstraints={{ left: -100, right: 100 }}
  onDragEnd={(_, info) => {
    if (info.offset.x > 50) onLike();
    if (info.offset.x < -50) onPass();
  }}
>
  {children}
</motion.div>
```

## Validation
- BottomSheet 열기/닫기 애니메이션 부드러움
- 스와이프 임계값이 적절 (오작동 방지)
- 탭 키보드 네비게이션 동작
- 뒤로가기 시 예상 라우트로 이동

## Anti-patterns
- 직접 motion.div로 BottomSheet 구현 (SKILL-03 사용)
- 터치 타깃 44px 미만
- 스와이프와 스크롤 충돌
- aria-* 속성 누락

## Output Template
- Scope:
- Files:
- Validation:
- Risks:
