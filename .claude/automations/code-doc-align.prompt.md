# code-doc-align — 코드↔문서 정합성 검사

## 메타
- **작업명**: DangApp 코드↔문서 정합성 자동 검사
- **스케줄**: 매일 03:30 (Asia/Seoul)
- **역할**: 코드 변경 사항과 문서(보드, 매트릭스, daily 로그) 사이의 불일치를 탐지하고 보고
- **프로젝트 루트**: `C:\Users\gmdqn\dangapp`

## Source of Truth 정책
- **코드가 진실**: `frontend/src/app/(main)/**` 라우트가 관리 대상
- **보드가 계획**: `docs/status/PAGE-UPGRADE-BOARD.md`
- **매트릭스가 검증**: `docs/status/11-FEATURE-PARITY-MATRIX.md`
- **daily 로그가 일지**: `docs/daily/MM-DD/page-*.md`

## 잠금
- 잠금 파일: `docs/status/.code-doc-align.lock`
- 시작 시: `{"status":"running","started_at":"<ISO>"}`
- 종료 시: `{"status":"released","released_at":"<ISO>"}`
- 이미 running이면 즉시 종료 (중복 방지)

## 절차

### Step 0 — Pre-check
1. 잠금 파일 확인/생성.
2. `DRY_RUN` 플래그 확인 (true면 보고만 하고 파일 수정 안 함).

### Step 1 — 라우트 수집
1. `frontend/src/app/(main)/` 하위 `page.tsx` 파일 목록 → `code_routes` 집합.
2. `PAGE-UPGRADE-BOARD.md` 테이블 파싱 → `board_routes` 집합.
3. `11-FEATURE-PARITY-MATRIX.md` 파싱 → `matrix_parity_ids` 집합.

### Step 2 — 차이 분석
1. **board에 없는 라우트**: `code_routes - board_routes` → `UNTRACKED` 리스트.
2. **코드에 없는 보드 항목**: `board_routes - code_routes` → `ORPHAN_BOARD` 리스트.
3. **parity ID 미연결**: board에 parity_ids가 있지만 매트릭스에 검증 기록 없는 것 → `UNVERIFIED` 리스트.

### Step 3 — Daily 로그 상태 집계
1. 가장 최근 `docs/daily/` 날짜 폴더의 `page-*.md` 파일 읽기.
2. 각 파일의 `## Status` 섹션에서 상태 추출 (Complete/InProgress/Blocked 등).
3. Board 상태와 daily 로그 상태 비교 → 불일치 시 `STATUS_MISMATCH` 리스트.

### Step 4 — Mock 데이터 잔존 검사
1. 각 `page.tsx`에서 `MOCK_`, `dummy`, `setTimeout.*setIsLoading`, `mock-guardian` 패턴 검색.
2. Board에서 QA/Done인데 mock 잔존 → `MOCK_RESIDUE` 리스트.

### Step 5 — 보고서 출력
1. `docs/status/INTEGRITY-REPORT.md` 덮어쓰기:
   ```
   # Integrity Report — {날짜}

   ## Summary
   | Check | Count |
   |-------|-------|
   | Untracked routes | N |
   | Orphan board entries | N |
   | Unverified parity IDs | N |
   | Status mismatches | N |
   | Mock residue | N |

   ## Details
   (각 리스트 상세)
   ```
2. `docs/status/INTEGRITY-HISTORY.ndjson` 끝에 1줄 append:
   ```json
   {"ts":"<ISO>","untracked":N,"orphan":N,"unverified":N,"mismatch":N,"mock_residue":N}
   ```

### Step 6 — 잠금 해제
1. 잠금 파일 released 상태로 업데이트.

## DRY_RUN=true
- Step 5에서 파일 수정 없이 터미널에 보고서 내용만 출력.
- 최종 출력: `[DRY_RUN] 변경 없음`

## 안전 규칙 (MUST)
- `frontend/src/` 코드 파일 절대 수정 금지.
- `docs/status/` 내 보고서·이력 파일만 쓰기 대상.
- Board 상태를 자동 변경하지 않음 (불일치만 보고).
- 변경 없으면 최종 출력: `변경 없음`
