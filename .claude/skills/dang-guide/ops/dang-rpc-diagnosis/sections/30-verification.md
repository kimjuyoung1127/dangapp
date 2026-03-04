# 30 — Verification (수정 후 검증)

## 체크리스트

### 1. DB 레벨 검증

```bash
# RPC 직접 호출로 결과 확인
curl -s "${SUPABASE_URL}/rest/v1/rpc/<rpc_name>" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"param":"value"}' | node -e "
    const d=require('fs').readFileSync(0,'utf8');
    const j=JSON.parse(d);
    console.log(j.length+' results');
    j.forEach(r=>console.log(JSON.stringify(r)));
  "
```

**기대**:
- [ ] 결과 행이 1개 이상
- [ ] 거리/점수 등 계산 값이 합리적
- [ ] 에러 없음

### 2. 마이그레이션 동기화 검증

```bash
npx supabase migration list
```

**기대**:
- [ ] 모든 행에서 Local = Remote (빈 칸 없음)
- [ ] 디버그 RPC가 drop 마이그레이션으로 정리됨

### 3. TypeScript 검증

```bash
cd frontend && npx tsc --noEmit -p ./tsconfig.json
```

**기대**:
- [ ] 에러 0개
- [ ] 새로 추가한 RPC 호출의 타입이 `database.types.ts`에 반영됨

### 4. Lint 검증

```bash
cd frontend && npx next lint
```

**기대**:
- [ ] 이번 변경 파일에서 새로운 에러 없음

### 5. 프론트엔드 연동 확인 (수동)

| 항목 | 방법 | 기대 결과 |
|---|---|---|
| 매칭 추천 | `/home` 접속 | 프로필 카드 1개 이상 표시 |
| 채팅방 생성 | 상호 매칭 후 채팅 진입 | 500 에러 없이 채팅방 표시 |
| 채팅방 목록 | `/chat` 접속 | 네트워크 탭에서 쿼리 수 5개 이하 |
| 약속 목록 | `/schedules` 접속 | 약속별 partner 이름 정상 표시 |
| 탭 전환 | 하단 탭 이동 | 불필요한 refetch 없음 |

## 정리 절차

1. 디버그 RPC drop 마이그레이션 적용 확인
2. 임시 시드 SQL 파일 정리 (supabase/seed/ 하위)
3. daily log 작성 (`docs/daily/MM-DD/page-<route>.md`)
4. PAGE-UPGRADE-BOARD 상태 업데이트

## Output Template

```
- Diagnosis: [원인 요약]
- Pattern: [A/B/C/D/E 중 해당]
- Fix: [수정 내용 1줄]
- Migrations: [적용된 마이그레이션 번호]
- Verification: [RPC 결과 N건 / tsc 통과 / lint 통과]
- Cleanup: [디버그 RPC drop 여부]
```
