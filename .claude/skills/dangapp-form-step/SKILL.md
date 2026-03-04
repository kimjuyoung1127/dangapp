---
name: dangapp-form-step
description: Zustand, RHF, Zod를 결합한 멀티 스텝/온보딩 폼 상태 관리 패턴
---

# dangapp-form-step (SKILL-07)

댕게팅 앱의 긴 가입 절차나 온보딩 페이즈를 한 번에 입력받지 않고, 여러 단계(Steps)로 쪼개어 단계별로 유효성 검사(RHF+Zod)를 통과한 데이터만 전역 상태(Zustand)에 누적시키는 강력한 폼 제어 패턴입니다.

## 📌 핵심 원칙
1. 단계 이동 상태(`step`, `nextStep`, `prevStep`)와 누적 폼 데이터(`data`, `updateData`)는 **Zustand Store**가 책임집니다.
2. 각 개별 스텝 뷰 로직 안에서는 폼 요소 제어 및 유효성 검사를 위해 **React Hook Form과 Zod**를 결합하여 처리합니다.
3. 개별 스텝에서 '다음' 버튼을 누르면 내부 데이터가 Valid 한지 검증하고 통과하면 Zustand에 임시 저장(merge)합니다.
4. **마지막 스텝에서만 서버(Supabase)에 한 번의 Insert/Update(API 호출) 액션**을 수행합니다.

## 🛠️ 적용 예시 (Zustand + 스텝 컴포넌트)

```tsx
// 1. 상태 저장소 (src/stores/useOnboardingStore.ts)
import { create } from 'zustand';

interface OnboardingState {
  step: number;
  maxStep: 7;
  formData: any;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Partial<any>) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  maxStep: 7,
  formData: {},
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, state.maxStep) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
  updateData: (newData) => set((state) => ({ formData: { ...state.formData, ...newData } })),
}));
```

```tsx
// 2. 단일 스텝 컴포넌트 (Step2DogInfo.tsx)
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useOnboardingStore } from "@/stores/useOnboardingStore";

const stepSchema = z.object({ dogName: z.string().min(1, "이름을 입력해주세요.") });

export function Step2DogInfo() {
  const { formData, updateData, nextStep } = useOnboardingStore();
  
  const form = useForm({
    resolver: zodResolver(stepSchema),
    defaultValues: { dogName: formData.dogName || "" },
  });

  const onSubmit = (values: any) => {
    updateData(values); // Zustand에 누적
    nextStep();         // 다음 페이지로 이동
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('dogName')} />
      <button type="submit">다음 스텝으로</button>
    </form>
  );
}
```

## 🚨 절대 금지 (Forbidden)
- 스텝 진입 시마다 Supabase에 Insert를 날려 더미 데이터를 만들지 마세요.
