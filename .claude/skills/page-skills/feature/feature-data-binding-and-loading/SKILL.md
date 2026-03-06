---
name: feature-data-binding-and-loading
description: MOCK_* 데이터를 TanStack Query 기반 실데이터로 교체하는 크로스 페이지 패턴.
---

# feature-data-binding-and-loading

## Trigger
- 라우트에서 mock 데이터를 실 Supabase 데이터로 교체할 때
- useQuery/useMutation 패턴 적용이 필요할 때

## Inputs
- 활성 라우트 및 대상 파일
- 관련 parity ID 및 현재 board 행

## Procedure
1. **MOCK_* 식별** — 페이지/컴포넌트에서 MOCK_, mock, setTimeout, 하드코딩 데이터 검색.
2. **훅 매핑** — 각 mock 데이터에 대응하는 Supabase 훅 확인 (기존 또는 신규 필요).
3. **TanStack Query 연결** — `useQuery({ queryKey: [...], queryFn: ... })` 패턴. queryKey 컨벤션: `['table-name', params]`.
4. **isLoading/isError/data 분기** — 로딩 시 Skeleton (SKILL-06), 에러 시 retry UI, 성공 시 실 데이터.
5. **뮤테이션 플로우** — `useMutation` + `onSuccess: () => queryClient.invalidateQueries()`.
6. **staleTime/gcTime 설정** — 데이터 특성에 맞는 캐시 전략. 채팅: 0, 프로필: 5분, 피드: 1분.

## Query Key Convention
```typescript
// 목록: ['table', filter?]
queryKey: ['guardians', { purpose: 'walk' }]
// 단건: ['table', 'detail', id]
queryKey: ['guardians', 'detail', guardianId]
// 관계: ['parent-table', parentId, 'child-table']
queryKey: ['chat-rooms', roomId, 'messages']
```

## Validation
- mock 데이터/setTimeout이 완전히 제거됨
- isLoading → Skeleton 표시
- isError → 에러 메시지 + retry 버튼
- data → 실 컴포넌트 렌더링
- queryClient.invalidateQueries가 뮤테이션 후 호출됨

## Anti-patterns
- 컴포넌트에서 직접 `supabase.from()` 호출 (SKILL-05 위반)
- `useState` + `useEffect`로 데이터 페칭 (TanStack Query 사용)
- queryKey에 함수/객체 참조 넣기
- staleTime 없이 불필요한 refetch 발생

## Output Template
- Scope:
- Files:
- Validation:
- Risks:
