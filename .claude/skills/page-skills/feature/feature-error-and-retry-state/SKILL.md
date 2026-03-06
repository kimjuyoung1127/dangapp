---
name: feature-error-and-retry-state
description: 에러 바운더리, 컴포넌트별 에러 처리, 재시도 패턴.
---

# feature-error-and-retry-state

## Trigger
- 에러 바운더리, 재시도 로직, 에러 메시지 구현 시

## Inputs
- 활성 라우트 및 대상 파일
- 관련 parity ID 및 현재 board 행

## Procedure
1. **에러 바운더리 확인** — `app/error.tsx`, `app/(main)/error.tsx` 글로벌 바운더리 존재 확인.
2. **컴포넌트별 isError+retry** — TanStack Query의 `isError` 상태 → 에러 UI + `refetch()` 버튼.
3. **toast/snackbar** — 뮤테이션 실패 시 toast 알림. "다시 시도해주세요" 메시지.
4. **네트워크 오프라인** — `navigator.onLine` 감지 → 오프라인 배너 표시.
5. **Realtime 연결 끊김** — Supabase Realtime 채널 상태 감지 → 재연결 시도.

## Error UI Pattern
```tsx
{isError && (
  <div className={cn(errorCardVariants({ severity: 'warning' }))}>
    <p>데이터를 불러오지 못했어요</p>
    <Button variant="ghost" size="sm" onClick={() => refetch()}>
      다시 시도
    </Button>
  </div>
)}
```

## Validation
- 에러 상태에서 retry 가능
- 네트워크 복구 시 자동 refetch
- 에러 메시지가 사용자 친화적 (기술 용어 없음)
- 에러 바운더리가 앱 크래시 방지

## Anti-patterns
- try/catch에서 에러를 무시 (console.log만)
- 기술적 에러 메시지 노출 ("500 Internal Server Error")
- 무한 재시도 루프
- 에러 상태에서 빈 화면 (에러 UI 없음)

## Output Template
- Scope:
- Files:
- Validation:
- Risks:
