# dang-rpc-diagnosis (Index)

Supabase RPC/쿼리가 빈 결과 또는 에러를 반환할 때, 원인을 체계적으로 진단하고 수정하는 운영 스킬.

이 문서는 인덱스 전용. 상세 내용은 `sections/` 하위 문서를 참조한다.

## Reading Order
1. `sections/00-overview.md` — 스킬 목적 및 적용 범위
2. `sections/10-diagnosis-runbook.md` — 단계별 진단 절차
3. `sections/20-fix-patterns.md` — 원인별 수정 패턴
4. `sections/30-verification.md` — 수정 후 검증 체크리스트

## Sections
| File | Purpose |
|---|---|
| `sections/00-overview.md` | 스킬 목적, 트리거, 적용 범위 |
| `sections/10-diagnosis-runbook.md` | REST API 직접 호출 → 임시 디버그 RPC → 필터 분해 진단 |
| `sections/20-fix-patterns.md` | 거리/RLS/visibility/매칭 히스토리 등 원인별 수정 |
| `sections/30-verification.md` | 수정 후 RPC 재호출, 프론트엔드 연동 확인 |
