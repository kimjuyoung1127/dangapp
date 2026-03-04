---
name: dangapp-cva-factory
description: CVA 및 Tailwind Merge를 활용한 공통 UI 프리미티브 컴포넌트 생성 패턴
---

# dangapp-cva-factory (SKILL-01 & SKILL-02)

이 스킬은 댕게팅(DangGeting) 프로젝트에서 모든 확장 가능하고 재사용 가능한 UI 프리미티브 컴포넌트를 만들 때 사용되는 표준 팩토리 패턴입니다.

## 📌 핵심 원칙
1. **모든 UI 컴포넌트는 CVA (Class Variance Authority)를 사용해야 합니다.** 인라인 조건부 클래스를 사용하지 마세요.
2. **모든 className 병합은 `cn()` 유틸리티 함수를 거쳐야 파편화를 방지할 수 있습니다.**
3. **Variant 속성**을 통해 의도(`intent`)와 크기(`size`), 모양(`radius`)을 엄격히 제어합니다.

## 🛠️ 적용 예시 (템플릿)

새로운 UI 요소 (예: `Badge`, `Card`, `Input` 등)를 생성할 때 다음 구조를 따르세요.

```tsx
"use client";
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const componentNameVariants = cva(
  "기본-공통-클래스 transition-all duration-200 focus-visible:outline-none",
  {
    variants: {
      variant: { 
        primary: "bg-primary text-white", 
        secondary: "bg-gray-100 text-foreground", 
        outline: "border border-primary text-primary" 
      },
      size: { 
        sm: "h-8 px-3 text-xs", 
        default: "h-12 px-6", 
        lg: "h-14 px-8 text-lg" 
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

export interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentNameVariants> {}

const Component = forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div className={cn(componentNameVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
Component.displayName = "Component";
export { Component, componentNameVariants };
```

## 🚨 절대 금지 (Forbidden)
- `<div className={`p-4 ${isActive ? 'bg-primary' : 'bg-gray'}`} />` 처럼 템플릿 리터럴로 직접 클래스를 조작하지 마세요. 모든 디자인 분기는 CVA의 `variants`에 기록되어야 합니다.
