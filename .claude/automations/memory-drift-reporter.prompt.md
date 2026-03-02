# memory-drift-reporter — MEMORY.md 드리프트 보고

## 메타
- **작업명**: DangApp MEMORY.md 드리프트 탐지 및 보고
- **스케줄**: 매일 05:30 (Asia/Seoul) — automation-health-monitor 이후
- **역할**: MEMORY.md의 Wave/priority/상태 주장을 실제 문서(PROJECT-STATUS, Board, Matrix)와 비교하여 불일치 보고
- **프로젝트 루트**: `C:\Users\gmdqn\dangapp`

## 비교 대상
```
MEMORY.md (세션 핸드오프용 상태 주장)
  ↕ 비교
PROJECT-STATUS.md (전체 진행률 — 실제 상태)
PAGE-UPGRADE-BOARD.md (라우트별 상태 — 실제 상태)
11-FEATURE-PARITY-MATRIX.md (Parity 검증 — 실제 상태)
```

## 잠금
- 잠금 파일: `docs/status/.memory-drift.lock`
- 시작 시: `{"status":"running","started_at":"<ISO>"}`
- 종료 시: `{"status":"released","released_at":"<ISO>"}`

## 절차

### Step 0 — Pre-check
1. 잠금 파일 확인/생성.
2. `DRY_RUN` 플래그 확인.

### Step 1 — MEMORY.md 상태 주장 파싱
1. MEMORY.md 파일 위치: 프로젝트 memory 디렉터리 (`.claude/projects/*/memory/MEMORY.md`).
2. 파싱 대상 섹션:
   - `## 현재 진행 상황 (Wave 체계)`: Wave별 상태 (완료/QA/InProgress 등)
   - `## 현재 우선순위 (Parity ID 기반)`: Parity ID별 상태 + 취소선(✅) 여부
   - 기타 상태 주장 (파일 경로, 도구 참조 등)
3. `memory_claims` 맵 생성:
   - `wave_status`: `{ "Wave 1": "완료", "Wave 2": "QA", ... }`
   - `parity_status`: `{ "DANG-INFRA-001": "완료", "DANG-ONB-001": "QA", ... }`
   - `file_paths`: MEMORY.md에서 참조하는 파일 경로 목록

### Step 2 — 실제 상태 수집
1. `PROJECT-STATUS.md` → Wave별 실제 상태 + 진행률.
2. `PAGE-UPGRADE-BOARD.md` → 라우트별 실제 상태 → Parity ID 매핑.
3. `11-FEATURE-PARITY-MATRIX.md` → Parity ID별 검증 상태.
4. `actual_status` 맵 생성.

### Step 3 — 불일치 탐지
1. **Wave 상태 드리프트**:
   - MEMORY 주장 vs PROJECT-STATUS 실제 → 불일치 시 `WAVE_DRIFT` 리스트.
   - 예: MEMORY "Wave 3: QA" but PROJECT-STATUS "Wave 3: InProgress".
2. **Parity ID 상태 드리프트**:
   - MEMORY 주장 vs Board 실제 → 불일치 시 `PARITY_DRIFT` 리스트.
   - 예: MEMORY "DANG-ONB-001: 완료" but Board "/onboarding: QA".
3. **파일 경로 드리프트**:
   - MEMORY에서 참조하는 파일 경로가 디스크에 실제 존재하는지 확인.
   - 존재하지 않는 경로 → `PATH_DRIFT` 리스트.
4. **우선순위 순서 드리프트**:
   - MEMORY의 "다음" 항목이 실제로 아직 미완료인지 확인.
   - 이미 완료된 항목이 "다음"으로 표시 → `PRIORITY_DRIFT` 리스트.

### Step 4 — 심각도 분류
1. 각 드리프트 항목에 심각도 부여:
   - `CRITICAL`: MEMORY가 실제보다 진행된 것으로 주장 (오인 유도)
   - `WARNING`: MEMORY가 실제보다 뒤처진 것으로 주장 (업데이트 필요)
   - `INFO`: 경로 참조 오류, 사소한 불일치
2. 전체 드리프트 점수: `CRITICAL × 3 + WARNING × 1 + INFO × 0`

### Step 5 — 보고서 출력 (DRY_RUN이 아닐 때만)
1. `docs/status/MEMORY-DRIFT-REPORT.md` 덮어쓰기:
   ```markdown
   # Memory Drift Report — {날짜}

   ## Drift Score: {점수} ({등급})

   ## Summary
   | Check | Count | Severity |
   |-------|-------|----------|
   | Wave status drift | N | ... |
   | Parity ID drift | N | ... |
   | File path drift | N | ... |
   | Priority drift | N | ... |

   ## Critical Drifts
   (MEMORY가 실제보다 앞선 것으로 주장하는 항목)
   | Item | MEMORY Claims | Actual Status |
   |------|-------------|---------------|
   | ... | ... | ... |

   ## Warning Drifts
   (MEMORY가 실제보다 뒤처진 항목 — 업데이트 필요)
   | Item | MEMORY Claims | Actual Status |
   |------|-------------|---------------|
   | ... | ... | ... |

   ## Info
   (깨진 경로 참조 등)

   ## Recommended MEMORY.md Edits
   (수동 수정 가이드 — 자동 수정 안 함)
   ```

### Step 6 — 잠금 해제

## DRY_RUN=true
- Step 5에서 파일 수정 없이 보고서 내용만 출력.
- 최종 출력: `[DRY_RUN] 변경 없음`

## 안전 규칙 (MUST)
- `frontend/src/` 코드 파일 절대 수정 금지.
- **MEMORY.md 자동 수정 절대 금지** (읽기 전용, 보고만).
- PROJECT-STATUS, Board, Matrix 수정 금지 (읽기 전용).
- `MEMORY-DRIFT-REPORT.md`만 쓰기 대상.
- 변경 없으면 최종 출력: `변경 없음`
