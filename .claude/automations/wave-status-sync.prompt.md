# wave-status-sync — Wave/Parity 상태 보드 자동 동기화

## 메타
- **작업명**: DangApp Wave 상태 보드 동기화
- **스케줄**: 매일 04:00 (Asia/Seoul)
- **역할**: 코드·daily 로그·보드 사이의 상태를 동기화하고 진행률 대시보드 갱신
- **프로젝트 루트**: `C:\Users\gmdqn\dangapp`

## Source of Truth 계층
```
코드 (page.tsx 구현 상태)
  ↓ 검증
Daily 로그 (docs/daily/MM-DD/page-*.md)
  ↓ 집계
PAGE-UPGRADE-BOARD.md (라우트별 상태)
  ↓ 요약
PROJECT-STATUS.md (전체 진행률)
  ↓ 기록
MEMORY.md (세션 핸드오프용)
```

## 잠금
- 잠금 파일: `docs/status/.wave-status-sync.lock`
- 시작 시: `{"status":"running","started_at":"<ISO>"}`
- 종료 시: `{"status":"released","released_at":"<ISO>"}`

## 절차

### Step 0 — Pre-check
1. 잠금 파일 확인/생성.
2. `DRY_RUN` 플래그 확인.

### Step 1 — Daily 로그 스캔
1. `docs/daily/` 전체 날짜 폴더에서 `page-*.md` 파일 수집.
2. 각 파일의 `## Status` 라인 파싱:
   - `✅ Complete` → `QA` (구현 완료, 검증 대기)
   - `🔄 InProgress` → `InProgress`
   - `⏸ Hold` → `Hold`
   - `✔ Verified` → `Done`
3. 라우트별 가장 최근 상태를 `daily_status` 맵으로 수집.

### Step 2 — Board 상태 비교
1. `PAGE-UPGRADE-BOARD.md` 파싱 → `board_status` 맵.
2. 각 라우트에 대해:
   - `daily_status`가 `board_status`보다 진행된 경우 → Board 업데이트 대상.
   - `daily_status`가 `board_status`보다 후퇴한 경우 → 경고 (자동 후퇴 금지).
3. 상태 진행 순서: `Ready < InProgress < QA < Done` (Hold는 별도).

### Step 3 — Board 업데이트 (DRY_RUN이 아닐 때만)
1. Board 테이블에서 해당 라우트의 `status` 컬럼과 `last_updated` 날짜 업데이트.
2. 상태가 후퇴하는 방향으로는 절대 변경하지 않음 (경고만 출력).

### Step 4 — Wave 진행률 집계
1. 각 Wave에 속한 Parity ID 그룹핑:
   - Wave 1: DANG-INFRA-001
   - Wave 2: DANG-ONB-001
   - Wave 3: DANG-MAT-001, DANG-CHT-001
   - Wave 4: DANG-WLK-001, DANG-DLG-001, DANG-PRF-001
   - Wave 5: DANG-B2B-001
2. 각 Wave의 진행률 계산:
   - 모든 라우트 Done → Wave Done
   - 일부 QA → Wave QA
   - 일부 InProgress → Wave InProgress
   - 전부 Ready → Wave Ready

### Step 5 — PROJECT-STATUS.md 갱신
1. `docs/status/PROJECT-STATUS.md`의 Wave 진행률 섹션 업데이트:
   ```markdown
   ## Wave Progress
   | Wave | Parity IDs | Status | Progress |
   |------|-----------|--------|----------|
   | 0 | workflow | Done | 100% |
   | 1 | INFRA-001 | Done | 100% |
   | 2 | ONB-001 | QA | 90% |
   | ... | ... | ... | ... |
   ```
2. 전체 진행률: `Done 라우트 수 / 전체 라우트 수 × 100%`.

### Step 6 — 동기화 로그 출력
1. `docs/status/WAVE-SYNC-LOG.md` 덮어쓰기:
   ```markdown
   # Wave Sync Log — {날짜}

   ## Board Updates
   | Route | Before | After |
   |-------|--------|-------|
   | ... | ... | ... |

   ## Wave Progress
   {Wave별 상태 테이블}

   ## Warnings
   {상태 후퇴 경고, 불일치 목록}
   ```
2. `docs/status/WAVE-SYNC-HISTORY.ndjson` 끝에 1줄 append.

### Step 7 — 잠금 해제

## DRY_RUN=true
- Step 3, Step 5에서 파일 수정 없이 계획만 출력.
- 최종 출력: `[DRY_RUN] 변경 없음`

## 안전 규칙 (MUST)
- `frontend/src/` 코드 파일 절대 수정 금지.
- Board 상태를 **후퇴 방향으로 변경 금지** (QA → Ready, Done → QA 등).
- Daily 로그 파일 수정 금지 (읽기만).
- MEMORY.md 자동 수정 금지 (세션 핸드오프 시 수동 업데이트).
- 변경 없으면 최종 출력: `변경 없음`
