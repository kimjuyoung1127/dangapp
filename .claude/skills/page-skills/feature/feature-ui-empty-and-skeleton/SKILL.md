---
name: feature-ui-empty-and-skeleton
description: 빈 상태 패턴, Skeleton 로딩, AnimatePresence 전환 패턴.
---

# feature-ui-empty-and-skeleton

## Trigger
- 빈 상태 UI, Skeleton 로딩, 상태 전환 애니메이션 구현 시

## Inputs
- 활성 라우트 및 대상 파일
- 관련 parity ID 및 현재 board 행

## Procedure
1. **빈 상태 패턴** — 데이터 0건일 때: 일러스트/아이콘 + 메시지 + CTA 버튼. 라우트별 맞춤 메시지.
2. **Skeleton = 실 UI 치수** — SKILL-06 패턴. Skeleton 박스가 최종 컴포넌트와 동일한 크기/레이아웃.
3. **AnimatePresence 전환** — Skeleton → 실 데이터 전환 시 `AnimatePresence` + `motion.div` 페이드.
4. **레이아웃 시프트 방지** — Skeleton과 실 UI의 높이/너비 일치. CLS(Cumulative Layout Shift) 최소화.

## Empty State Pattern
```tsx
{data?.length === 0 && (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <EmptyIcon className="w-16 h-16 text-gray-300" />
    <p className="text-gray-500 text-center">아직 {contentName}이 없어요</p>
    <Button variant="primary" size="sm" onClick={onCTA}>
      {ctaLabel}
    </Button>
  </div>
)}
```

## Skeleton Pattern
```tsx
{/* 카드 스켈레톤 — 실 카드와 동일 치수 */}
<div className="animate-pulse space-y-3">
  <div className="h-48 bg-gray-200 rounded-2xl" />
  <div className="h-5 bg-gray-200 rounded w-3/4" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
</div>
```

## Validation
- Skeleton이 실 UI와 크기 일치
- 빈 상태에 적절한 CTA 존재
- AnimatePresence 전환이 부드러움
- 레이아웃 시프트 없음

## Anti-patterns
- 중앙 스피너 (Skeleton 사용, SKILL-06)
- 빈 상태에서 "데이터 없음"만 표시 (CTA 없음)
- Skeleton 없이 갑자기 데이터 나타남
- Skeleton과 실 UI 크기 불일치

## Output Template
- Scope:
- Files:
- Validation:
- Risks:
