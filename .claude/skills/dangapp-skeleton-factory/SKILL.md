---
name: dangapp-skeleton-factory
description: 실제 UI 레이아웃 형태를 유지하는 스켈레톤 로딩 상태 패턴
---

# dangapp-skeleton-factory (SKILL-06)

설계된 페이지에서 데이터를 받아올 때, 단조롭고 맥락 없는 회색 원형 스피너(Spinner)를 보여주는 대신, **실제 나타날 UI의 본래 형태(뼈대)를 본뜬 스켈레톤(Skeleton) 애니메이션**을 제공하여 사용자에게 부드러운 전환 심리를 유도합니다.

## 📌 핵심 원칙
1. 데이터를 기다리는 동안 로딩 스피너의 사용을 최소화/금지합니다.
2. 로딩 전용 `<Skeleton />` 요소는 Tailwind의 `animate-pulse` 클래스를 사용해 심장 박동처럼 깜빡여야 합니다.
3. 스켈레톤 박스의 크기와 둥글기(Radius)는 실제 로드될 UI 구성요소와 **100% 동일한 규격**을 가져야 합니다.

## 🛠️ 적용 예시 (스켈레톤 래퍼)

```tsx
// 1. 공용 컴포넌트: src/components/ui/Skeleton.tsx
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/50", className)}
      {...props}
    />
  )
}
```

```tsx
// 2. 사용처: 강아지 매칭 프로필 카드가 로딩 중일 때
export function DogProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 border rounded-3xl">
      {/* 사진 대체 - 실제 사진과 같은 3xl 라운디드 */}
      <Skeleton className="h-64 w-full rounded-3xl" />
      
      <div className="space-y-2">
        {/* 제목 대체 텍스트 줄 */}
        <Skeleton className="h-5 w-1/2 rounded-xl" />
        {/* 설명 대체 텍스트 줄들 */}
        <Skeleton className="h-4 w-full rounded-xl" />
        <Skeleton className="h-4 w-4/5 rounded-xl" />
      </div>

      <div className="flex gap-2">
         {/* 강아지 특성 뱃지(알약 모양) 대체 */}
         <Skeleton className="h-6 w-16 rounded-full" />
         <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}
```

## 🚨 절대 금지 (Forbidden)
- 화면 한가운데에 `<Spinner />`만 덩그러니 놓아두는 페이지 렌더링을 피하세요.
