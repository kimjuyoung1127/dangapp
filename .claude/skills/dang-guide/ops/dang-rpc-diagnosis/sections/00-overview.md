# 00 — Overview

## 목적
Supabase RPC 또는 REST 쿼리가 예상과 다른 결과(빈 배열, 500 에러, 누락 행)를 반환할 때,
**프론트엔드 코드를 수정하기 전에** DB 레벨에서 원인을 체계적으로 분리하고 수정하는 절차.

## Trigger
- 프론트엔드에서 RPC 호출 결과가 `[]` 또는 에러
- 네트워크 탭에서 Supabase REST 응답이 `500`, `403`, `[]`
- 쿼리는 성공하지만 기대 행이 누락됨

## 적용 범위
| 대상 | 예시 |
|---|---|
| RPC 빈 결과 | `match_guardians_v2` → `[]` |
| RLS 차단 | `chat_participants` INSERT → 500 |
| 데이터 부재 | location IS NULL → RPC 조기 RETURN |
| 필터 불일치 | 거리 초과, visibility enum, 이미 매칭됨 |

## 전제 조건
- Supabase CLI 로그인 상태 (`npx supabase projects list` 확인)
- `frontend/.env.local`에 `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` 존재
- REST API 직접 호출 가능 (curl)
