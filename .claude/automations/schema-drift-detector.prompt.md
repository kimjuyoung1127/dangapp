# schema-drift-detector — 스키마 드리프트 탐지

## 메타
- **작업명**: DangApp 스키마 3-Way 드리프트 탐지
- **스케줄**: 매일 02:00 (Asia/Seoul)
- **역할**: database.types.ts ↔ SCHEMA-CHANGELOG.md ↔ 훅 `.from()` 호출 간 3-Way 불일치 탐지
- **프로젝트 루트**: `C:\Users\gmdqn\dangapp`

## 3-Way 비교 대상
```
database.types.ts (TypeScript 타입 정의 — 테이블 목록)
  ↕ 비교
SCHEMA-CHANGELOG.md (스키마 변경 이력 — 테이블/컬럼 기록)
  ↕ 비교
hooks/*.ts .from("table") (실제 코드에서 사용하는 테이블명)
```

## 잠금
- 잠금 파일: `docs/status/.schema-drift.lock`
- 시작 시: `{"status":"running","started_at":"<ISO>"}`
- 종료 시: `{"status":"released","released_at":"<ISO>"}`

## 절차

### Step 0 — Pre-check
1. 잠금 파일 확인/생성.
2. `DRY_RUN` 플래그 확인.

### Step 1 — database.types.ts 테이블 추출
1. `frontend/src/types/database.types.ts` 읽기.
2. `Tables` 인터페이스/타입에서 테이블명 추출 → `types_tables` 집합.
3. 각 테이블의 컬럼명 추출 → `types_columns` 맵: `{ table: [col1, col2, ...] }`

### Step 2 — SCHEMA-CHANGELOG.md 테이블 추출
1. `docs/ref/SCHEMA-CHANGELOG.md` 읽기.
2. 테이블 생성/변경 기록에서 테이블명 추출 → `changelog_tables` 집합.
3. 가능하면 컬럼 정보도 추출 → `changelog_columns` 맵.

### Step 3 — 훅 `.from()` 패턴 추출
1. `frontend/src/lib/hooks/` 하위 모든 `.ts` 파일 스캔.
2. `.from("테이블명")` 패턴 정규식 매칭 → `hook_tables` 집합.
3. 각 테이블을 사용하는 훅 파일 기록 → `hook_table_usage` 맵: `{ table: [file1, file2, ...] }`

### Step 4 — 3-Way 차이 분석
1. **Types에만 존재** (코드 미사용):
   - `types_tables - hook_tables` → `UNUSED_TABLES` 리스트.
   - 참고용 (반드시 문제는 아님, 아직 구현 안 된 테이블).
2. **훅에서 사용하지만 Types에 없음** (위험):
   - `hook_tables - types_tables` → `UNTYPED_TABLES` 리스트.
   - 런타임 에러 가능성 → 높은 우선순위 경고.
3. **Changelog에 없지만 Types에 존재**:
   - `types_tables - changelog_tables` → `UNDOCUMENTED_TABLES` 리스트.
   - 문서 갭 → 중간 우선순위.
4. **Changelog에 있지만 Types에 없음**:
   - `changelog_tables - types_tables` → `STALE_CHANGELOG` 리스트.
   - 이전 스키마 잔재 또는 types 미갱신.

### Step 5 — 컬럼 레벨 드리프트 (선택적)
1. `hook_tables`과 `types_tables` 교집합 테이블에 대해:
2. 훅에서 `.select("col1, col2")` 패턴 추출 → 훅이 기대하는 컬럼.
3. `types_columns`에서 해당 테이블 컬럼과 비교.
4. 훅이 참조하지만 Types에 없는 컬럼 → `MISSING_COLUMNS` 리스트.

### Step 6 — 보고서 출력 (DRY_RUN이 아닐 때만)
1. `docs/status/SCHEMA-DRIFT-REPORT.md` 덮어쓰기:
   ```markdown
   # Schema Drift Report — {날짜}

   ## Summary
   | Check | Count | Severity |
   |-------|-------|----------|
   | Unused tables (types only) | N | Info |
   | Untyped tables (hooks only) | N | Critical |
   | Undocumented tables | N | Warning |
   | Stale changelog entries | N | Info |
   | Missing columns | N | Warning |

   ## Critical: Untyped Tables
   | Table | Used In |
   |-------|---------|
   | ... | ... |

   ## Warning: Undocumented Tables
   (Types에 있지만 SCHEMA-CHANGELOG에 기록 없음)

   ## Info: Unused Tables
   (Types에 정의되었지만 아직 훅에서 사용하지 않는 테이블)

   ## Info: Stale Changelog
   (Changelog에 있지만 현재 Types에 없는 테이블)

   ## Column-Level Drift
   | Table | Column | Issue |
   |-------|--------|-------|
   | ... | ... | ... |
   ```
2. `docs/status/SCHEMA-DRIFT-HISTORY.ndjson` 끝에 1줄 append:
   ```json
   {"ts":"<ISO>","unused":N,"untyped":N,"undocumented":N,"stale":N,"missing_cols":N}
   ```

### Step 7 — 잠금 해제

## DRY_RUN=true
- Step 6에서 파일 수정 없이 보고서 내용만 출력.
- 최종 출력: `[DRY_RUN] 변경 없음`

## 안전 규칙 (MUST)
- `frontend/src/` 코드 파일 절대 수정 금지.
- `database.types.ts` 자동 수정 금지 (보고만).
- `SCHEMA-CHANGELOG.md` 자동 수정 금지 (보고만).
- 훅 파일 자동 수정 금지 (보고만).
- 변경 없으면 최종 출력: `변경 없음`
