---
name: feature-form-validation-and-submit
description: Zod + React Hook Form 기반 폼 유효성 검증 및 제출 패턴.
---

# feature-form-validation-and-submit

## Trigger
- 폼 유효성 검증, 제출 상태, 제출 후 피드백 구현 시

## Inputs
- 활성 라우트 및 대상 파일
- 관련 parity ID 및 현재 board 행

## Procedure
1. **Zod 스키마 정의** — 각 폼 필드에 대한 유효성 규칙. `.required()` vs `.optional()` 구분.
2. **RHF zodResolver 연결** — `useForm({ resolver: zodResolver(schema) })`.
3. **필드별 에러 표시** — `formState.errors[field]` → CVA 에러 variant. 인라인 에러 메시지.
4. **제출 플로우** — `handleSubmit` → `useMutation.mutate()` → 성공/실패 피드백.
5. **제출 중 상태** — 버튼 disabled + 로딩 인디케이터. 중복 제출 방지.
6. **성공 피드백** — toast/snackbar 또는 라우트 이동. 폼 리셋.

## Zod Pattern
```typescript
const schema = z.object({
  nickname: z.string().min(2, '2자 이상 입력해주세요'),
  email: z.string().email('올바른 이메일을 입력해주세요').optional(),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: '필수 동의 항목입니다' }) }),
});
```

## Validation
- 모든 필수 필드 미입력 시 에러 메시지 표시
- 유효한 입력으로 제출 성공
- 제출 중 버튼 비활성화
- 서버 에러 시 사용자 친화적 메시지

## Anti-patterns
- 직접 DOM validation (HTML5 required/pattern) 의존
- 에러 메시지를 alert()으로 표시
- 제출 중 상태 관리 없음 (중복 제출 가능)
- Zod 스키마 없이 수동 if/else 검증

## Output Template
- Scope:
- Files:
- Validation:
- Risks:
