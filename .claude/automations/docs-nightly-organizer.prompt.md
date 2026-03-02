# docs-nightly-organizer — Daily 로그 압축 + Docs 구조 정리

## 메타
- **작업명**: DangApp 문서 야간 정리 자동화
- **스케줄**: 매일 22:00 (Asia/Seoul)
- **역할**: daily 로그 주간 압축, docs 폴더 구조 유지, 참조 경로 정합성 보장
- **프로젝트 루트**: `C:\Users\gmdqn\dangapp`

## 폴더 구조 규칙
```
docs/
├── ref/          ← 영구 참조 문서 (SCHEMA-CHANGELOG, SUPABASE-MCP-RUNBOOK 등)
├── status/       ← 상태 보드 + 매트릭스 + 보고서
├── daily/        ← 날짜별 작업 일지 (MM-DD/)
├── weekly/       ← 주간 요약 (자동 생성)
└── CLAUDE.md     ← 폴더 가이드
```

## 잠금
- 잠금 파일: `docs/.docs-nightly.lock`
- 시작 시: `{"status":"running","started_at":"<ISO>"}`
- 종료 시: `{"status":"released","released_at":"<ISO>"}`

## 절차

### Step 0 — Pre-check
1. 잠금 파일 확인/생성.
2. `DRY_RUN` 플래그 확인.

### Step 1 — Daily 로그 폴더 스캔
1. `docs/daily/` 하위 날짜 폴더 목록 수집 (MM-DD 형식).
2. 각 폴더의 `page-*.md` 파일 목록 수집.
3. 오늘 날짜 기준 7일 이전 폴더 식별 → `stale_folders` 리스트.

### Step 2 — 주간 압축 (7일 이상 된 daily만)
1. stale_folders를 ISO 주차(YYYY-WNN) 기준으로 그룹핑.
2. 각 주차별로 `docs/weekly/YYYY-WNN.md` 생성/머지:
   - 기존 weekly 파일이 있으면 내용 머지 (덮어쓰기 금지).
   - 신규면 생성.
3. Weekly 파일 포맷:
   ```markdown
   # Week {YYYY-WNN} Summary

   ## Parity IDs Touched
   - {목록}

   ## Route Changes
   | Route | Status | Parity ID |
   |-------|--------|-----------|
   | ... | ... | ... |

   ## Daily Logs Included
   - {날짜}: {파일 목록}
   ```
4. 성공 기준: 파일 존재 + size > 0 + 필수 헤더 포함.
5. **이번 실행에서 실제 요약에 포함된 daily 폴더만 삭제** (안전).

### Step 3 — 문서 위치 검증
1. `docs/` 루트에 ref/status/daily/weekly가 아닌 .md 파일 존재 → `MISPLACED` 리스트.
2. `docs/ref/` 내 날짜명 폴더 존재 → `MISPLACED` 리스트.
3. MISPLACED 항목은 보고만 (자동 이동 안 함).

### Step 4 — 참조 경로 검증
1. `docs/status/PROJECT-STATUS.md` 존재 확인.
2. `PAGE-UPGRADE-BOARD.md` 존재 확인.
3. `CLAUDE.md`(루트)의 Source of Truth Docs 테이블에서 참조되는 파일 존재 확인.
4. 깨진 참조 → `BROKEN_REF` 리스트.

### Step 5 — 로그 출력
1. `docs/status/NIGHTLY-RUN-LOG.md` 덮어쓰기:
   ```markdown
   # Nightly Run Log — {날짜}

   ## Actions
   - Compressed: {N} daily folders → {M} weekly files
   - Misplaced files: {N}
   - Broken references: {N}

   ## Details
   (상세 내역)
   ```

### Step 6 — 잠금 해제

## DRY_RUN=true
- Step 2에서 파일 생성/삭제 없이 계획만 출력.
- 최종 출력: `[DRY_RUN] 변경 없음`

## 안전 규칙 (MUST)
- `frontend/src/` 코드 파일 절대 수정 금지.
- daily 폴더 삭제는 주간 요약에 포함 확인 후에만 수행.
- 기존 weekly 파일 덮어쓰기 금지 (머지만 허용).
- MISPLACED 파일은 보고만 (자동 이동 금지).
- 변경 없으면 최종 출력: `변경 없음`
