# parity-cascade-sync — Parity ID 캐스케이드 동기화

## 메타
- **작업명**: DangApp Parity ID 캐스케이드 상태 동기화
- **스케줄**: 매일 04:30 (Asia/Seoul) — wave-status-sync 이후
- **역할**: Board → Matrix → PROJECT-STATUS → MISSING-AND-UNIMPLEMENTED 순으로 Parity ID 상태를 계단식 전파
- **프로젝트 루트**: `C:\Users\gmdqn\dangapp`

## Source of Truth 캐스케이드
```
PAGE-UPGRADE-BOARD.md (라우트별 parity_ids + status)
  ↓ parity ID 상태 집계
11-FEATURE-PARITY-MATRIX.md (parity ID별 검증 상태)
  ↓ 완료율 반영
PROJECT-STATUS.md (전체 진행률 + Wave 상태)
  ↓ 해결된 항목 표시
MISSING-AND-UNIMPLEMENTED.md (미구현 갭 → resolved 마킹)
```

## 잠금
- 잠금 파일: `docs/status/.parity-cascade.lock`
- 시작 시: `{"status":"running","started_at":"<ISO>"}`
- 종료 시: `{"status":"released","released_at":"<ISO>"}`

## 절차

### Step 0 — Pre-check
1. 잠금 파일 확인/생성.
2. `DRY_RUN` 플래그 확인.

### Step 1 — Board에서 Parity ID 상태 수집
1. `PAGE-UPGRADE-BOARD.md` 파싱.
2. 각 라우트의 `parity_ids` 컬럼에서 Parity ID 추출.
3. 라우트 status를 해당 Parity ID에 매핑:
   - 같은 Parity ID가 여러 라우트에 있으면 가장 낮은 상태 채택.
   - 예: DANG-CHT-001이 `/chat`(QA) + `/chat/[id]`(QA) → QA.
   - 예: DANG-MAT-001이 `/home`(QA) + `/modes`(Ready) → Ready (InProgress 미만이면 InProgress).
4. `parity_board_status` 맵 생성: `{ "DANG-CHT-001": "QA", ... }`

### Step 2 — Matrix 현재 상태 파싱
1. `11-FEATURE-PARITY-MATRIX.md` 파싱.
2. 각 Parity ID의 현재 상태 추출 → `parity_matrix_status` 맵.
3. 상태 진행 순서: `Not Started < InProgress < Partial < QA < Verified`

### Step 3 — Matrix 업데이트 대상 식별
1. Board 상태와 Matrix 상태 비교:
   - Board에서 진행된 경우 → Matrix 업데이트 대상 (`ADVANCE` 리스트).
   - Board에서 후퇴한 경우 → 경고만 (`REGRESSION_WARN` 리스트, 자동 변경 안 함).
   - Board에 없는 Matrix 항목 → 경고 (`ORPHAN_MATRIX` 리스트).
2. Board→Matrix 상태 매핑:
   - Board Ready → Matrix Not Started
   - Board InProgress → Matrix InProgress
   - Board QA → Matrix QA
   - Board Done → Matrix Verified

### Step 4 — Matrix 업데이트 (DRY_RUN이 아닐 때만)
1. `ADVANCE` 리스트의 항목만 Matrix 테이블에서 상태 업데이트.
2. 각 항목에 `last_verified` 날짜 갱신.
3. 후퇴 방향 변경 절대 금지.

### Step 5 — PROJECT-STATUS.md 동기화
1. `PROJECT-STATUS.md` 읽기.
2. Wave별 Parity ID 집계:
   - Wave 1: DANG-INFRA-001
   - Wave 2: DANG-ONB-001
   - Wave 3: DANG-MAT-001, DANG-CHT-001
   - Wave 4: DANG-WLK-001, DANG-DLG-001, DANG-PRF-001
   - Wave 5: DANG-B2B-001
3. 각 Wave의 완료율 계산: `Verified 수 / 전체 수 × 100%`
4. PROJECT-STATUS.md의 Wave Progress 섹션 업데이트.
5. 전체 진행률 갱신.

### Step 6 — MISSING-AND-UNIMPLEMENTED.md 갭 해소 표시
1. `MISSING-AND-UNIMPLEMENTED.md` 파싱.
2. Matrix에서 `Verified` 상태인 Parity ID 관련 항목 찾기.
3. 해당 항목에 `[RESOLVED]` 마커 추가 (삭제 안 함).
4. 이미 `[RESOLVED]`인 항목은 건드리지 않음.

### Step 7 — 동기화 로그 출력
1. `docs/status/PARITY-CASCADE-LOG.md` 덮어쓰기:
   ```markdown
   # Parity Cascade Sync Log — {날짜}

   ## Board → Matrix Updates
   | Parity ID | Board Status | Matrix Before | Matrix After |
   |-----------|-------------|---------------|-------------|
   | ... | ... | ... | ... |

   ## PROJECT-STATUS Updates
   | Wave | Before | After | Progress |
   |------|--------|-------|----------|
   | ... | ... | ... | ... |

   ## MISSING-AND-UNIMPLEMENTED Resolved
   | Item | Parity ID | Status |
   |------|-----------|--------|
   | ... | ... | [RESOLVED] |

   ## Warnings
   {후퇴 경고, 고아 항목}
   ```
2. `docs/status/PARITY-CASCADE-HISTORY.ndjson` 끝에 1줄 append:
   ```json
   {"ts":"<ISO>","advanced":N,"regress_warn":N,"orphan":N,"resolved":N,"overall_pct":NN}
   ```

### Step 8 — 잠금 해제

## DRY_RUN=true
- Step 4, Step 5, Step 6에서 파일 수정 없이 계획만 출력.
- 최종 출력: `[DRY_RUN] 변경 없음`

## 안전 규칙 (MUST)
- `frontend/src/` 코드 파일 절대 수정 금지.
- Matrix/Board 상태를 **후퇴 방향으로 변경 금지** (경고만 출력).
- MISSING-AND-UNIMPLEMENTED.md 항목 삭제 금지 (`[RESOLVED]` 마커만 추가).
- Daily 로그 파일 수정 금지.
- 변경 없으면 최종 출력: `변경 없음`
