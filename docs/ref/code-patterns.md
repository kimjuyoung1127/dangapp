# DangApp Code Patterns (Source of Truth)

이 문서는 DangApp 프론트엔드의 핵심 코딩 규칙 원본입니다.
새 코드 작성 시 반드시 참조하고, pre-commit 스크립트가 기계적으로 검증합니다.

---

## 1. 디자인 토큰 (Design Tokens)

**원칙**: `tailwind.config.ts`에 정의된 토큰만 사용. 임의값(arbitrary value) 금지.

### 금지 패턴

```tsx
// BAD — 임의 radius
className="rounded-[2rem]"
className="rounded-[1.75rem]"

// BAD — 임의 font size
className="text-[28px]"
className="text-[11px]"

// BAD — 하드코딩 색상
className="bg-[#E5E7EB]"
className="border-sky-100"    // config에 없는 Tailwind 기본 색상
stroke="#1E88E5"              // SVG에서 하드코딩

// BAD — 임의 shadow
className="shadow-[0_20px_60px_-28px_rgba(...)]"
```

### 올바른 패턴

```tsx
// GOOD — config 토큰 사용
className="rounded-3xl"       // 1.5rem (tailwind.config.ts)
className="rounded-xl"        // 0.75rem (tailwind.config.ts)

// GOOD — 시맨틱 색상
className="bg-card"           // #FFFFFF
className="bg-background"     // #F5F7FA
className="text-foreground"   // #111827
className="border-border"     // #E5E7EB
className="text-primary"      // #1E88E5

// GOOD — 필요한 값은 config에 추가 후 사용
// tailwind.config.ts → theme.extend.borderRadius에 추가
```

### 새 토큰이 필요할 때

1. `tailwind.config.ts`의 `theme.extend`에 토큰 추가
2. 시맨틱 이름 사용 (e.g., `"card-lg": "2rem"`)
3. 이 문서의 토큰 목록 업데이트

---

## 2. 컴포넌트 패턴

### 네이밍
- 컴포넌트 파일: **PascalCase** (`ProfileHeader.tsx`)
- 폴더: **kebab-case** (`features/profile/`)
- 훅 파일: **camelCase** with `use` prefix (`useProfile.ts`)

### CVA + cn() 패턴

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const componentVariants = cva("base-classes", {
  variants: { variant: {}, size: {} },
  defaultVariants: {},
});

export interface ComponentProps extends VariantProps<typeof componentVariants> {
  className?: string;
}

export default function Component({ variant, size, className }: ComponentProps) {
  return <div className={cn(componentVariants({ variant, size }), className)} />;
}
```

### Motion 래퍼

```tsx
// GOOD — 공유 래퍼 사용
import { ScrollReveal, TapScale } from "@/components/ui/MotionWrappers";

// BAD — raw framer-motion 직접 사용
import { motion } from "framer-motion";
<motion.div animate={...} />
```

---

## 3. Import 규칙

```tsx
// GOOD — alias import (크로스 폴더)
import { Button } from "@/components/ui/Button";
import { useProfile } from "@/lib/hooks/useProfile";

// GOOD — 상대 import (같은 feature 폴더 내 sibling만)
import ReviewCard from "./ReviewCard";

// BAD — 크로스 폴더 상대 import
import { Button } from "../../ui/Button";
```

---

## 4. 데이터 접근 패턴

### Supabase — 훅 전용

```tsx
// GOOD — 훅을 통한 접근
const { data: guardian } = useCurrentGuardian();
const { mutate: updateProfile } = useUpdateGuardian();

// BAD — 컴포넌트에서 직접 호출
const supabase = createClient();
const { data } = await supabase.from("guardians").select("*");
```

### 상태 분리

| 도메인 | 도구 | 예시 |
|--------|------|------|
| 서버 데이터 | TanStack Query | `useQuery`, `useMutation` |
| UI 상태 | Zustand | `useModeStore`, `useOnboardingStore` |
| 폼 상태 | React Hook Form + Zod | `useForm({ resolver: zodResolver(schema) })` |

---

## 5. 파일 구조

```
frontend/src/
├── app/              # Next.js App Router 라우트
├── components/
│   ├── ui/           # 공유 프리미티브 (Button, MotionWrappers 등)
│   └── features/     # 도메인별 컴포넌트
│       ├── profile/
│       ├── chat/
│       ├── walk/
│       └── ...
├── lib/
│   ├── hooks/        # 데이터 훅 (useProfile, useChat 등)
│   ├── supabase/     # Supabase 클라이언트
│   └── utils.ts      # cn() 등 유틸리티
├── stores/           # Zustand 스토어
└── types/            # 공유 타입
```

---

## 6. 타입 패턴

```tsx
// DB 타입 — Supabase 생성 타입 활용
type Guardian = Database["public"]["Tables"]["guardians"]["Row"];

// 컴포넌트 Props — interface 선언
interface ProfileHeaderProps {
  nickname: string;
  dogName?: string;
  trustLevel: number;
}
```
