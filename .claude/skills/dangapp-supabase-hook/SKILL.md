---
name: dangapp-supabase-hook
description: TanStack Query를 활용한 Supabase 데이터 통신 로직 캡슐화 패턴
---

# dangapp-supabase-hook (SKILL-05)

이 스킬은 React 컴포넌트 내에서 Supabase DB에 직접 접근하는 것을 막고, 서버 상태(Server State) 관리 도구인 **TanStack Query(React Query)와 커스텀 훅(Hook)**을 결합하여 데이터 요청을 단일화하는 패턴입니다.

## 📌 핵심 원칙
1. **컴포넌트(`.tsx`) 내부에서 `supabase.from(...)`을 직접 호출하는 것을 엄격히 금지합니다.**
2. 모든 데이터 Fetch(조회) 및 Mutation(생성/수정/삭제) 작업은 `src/lib/hooks/` 폴더 내의 커스텀 훅으로 추출해야 합니다.
3. 훅은 항상 캐싱, 재검증, 로딩 상태, 에러 상태를 제공해야 합니다. (TanStack Query 사용)

## 🛠️ 적용 예시 (커스텀 훅)

```tsx
// 파일: src/lib/hooks/useGuardians.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

// ✅ Fetch 훅 (데이터 조회)
export function useGuardianProfile(userId: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['guardian', userId],
    queryKeyHashFn: undefined, // default
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guardians')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!userId, // userId가 있을 때만 실행
  });
}

// ✅ Mutation 훅 (데이터 쓰기 및 쿼리 무효화)
export function useUpdateGuardian() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { data, error } = await supabase
        .from('guardians')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    // 성공 시 해당 캐시를 무효화(invalidate)하여 자동 리패치
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['guardian', data.user_id] });
    },
  });
}
```

## 🚨 절대 금지 (Forbidden)
- `useEffect` 안에서 Supabase Fetch를 수행하고 `useState`로 데이터를 담는 옛날 방식은 절대 금지합니다.
