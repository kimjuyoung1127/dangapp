# automation-health-monitor — 자동화 헬스 모니터

## 메타
- **작업명**: DangApp 자동화 헬스 모니터링
- **스케줄**: 매일 05:00 (Asia/Seoul)
- **역할**: 모든 자동화 프롬프트의 잠금 상태·산출물 신선도·실행 이력을 점검하고 대시보드 갱신
- **프로젝트 루트**: `C:\Users\gmdqn\dangapp`

## 자동화 레지스트리
```
| ID | 프롬프트 파일 | 잠금 파일 | 산출물 |
|----|--------------|----------|--------|
| A1 | code-doc-align.prompt.md | docs/status/.code-doc-align.lock | INTEGRITY-REPORT.md, INTEGRITY-HISTORY.ndjson |
| A2 | docs-nightly-organizer.prompt.md | docs/.docs-nightly.lock | NIGHTLY-RUN-LOG.md |
| A3 | wave-status-sync.prompt.md | docs/status/.wave-status-sync.lock | WAVE-SYNC-LOG.md, WAVE-SYNC-HISTORY.ndjson |
| A4 | parity-cascade-sync.prompt.md | docs/status/.parity-cascade.lock | PARITY-CASCADE-LOG.md, PARITY-CASCADE-HISTORY.ndjson |
| A5 | skill-doc-integrity.prompt.md | docs/status/.skill-doc-integrity.lock | SKILL-DOC-INTEGRITY-REPORT.md |
| A6 | schema-drift-detector.prompt.md | docs/status/.schema-drift.lock | SCHEMA-DRIFT-REPORT.md, SCHEMA-DRIFT-HISTORY.ndjson |
| A7 | memory-drift-reporter.prompt.md | docs/status/.memory-drift.lock | MEMORY-DRIFT-REPORT.md |
| A8 | slack-completion-report.prompt.md | (없음) | Slack 메시지 |
| A9 | session-bootstrap.prompt.md | (없음) | (없음, 읽기 전용) |
```

## 잠금
- 잠금 파일: `docs/status/.automation-health.lock`
- 시작 시: `{"status":"running","started_at":"<ISO>"}`
- 종료 시: `{"status":"released","released_at":"<ISO>"}`

## 절차

### Step 0 — Pre-check
1. 잠금 파일 확인/생성.
2. `DRY_RUN` 플래그 확인.

### Step 1 — 잠금 상태 스캔
1. 레지스트리의 각 자동화 잠금 파일 읽기.
2. 상태 분류:
   - 잠금 파일 없음 → `CLEAR` (정상, 한 번도 실행 안 됨 또는 정상 해제)
   - `status: "released"` → `CLEAR`
   - `status: "running"` + `started_at`이 2시간 이내 → `RUNNING`
   - `status: "running"` + `started_at`이 2시간 초과 → `STUCK` (경고)
3. `lock_status` 맵 생성.

### Step 2 — 산출물 신선도 검사
1. 각 자동화의 산출물 파일 존재 여부 확인.
2. 산출물이 있으면 파일 수정일(mtime) 확인:
   - 스케줄 주기 × 2 이내 → `FRESH`
   - 스케줄 주기 × 2 초과, × 5 이내 → `STALE`
   - 스케줄 주기 × 5 초과 → `EXPIRED`
   - 파일 미존재 → `MISSING`
3. 신선도 기준 (각 자동화별):
   - 매일 스케줄: FRESH ≤ 48h, STALE ≤ 120h
   - 이벤트 기반 (slack-completion): 최근 7일 이내 실행 → FRESH
4. `freshness_status` 맵 생성.

### Step 3 — 이력 파일 검사
1. `.ndjson` 이력 파일 존재 여부 확인.
2. 마지막 줄의 타임스탬프 추출 → 최근 실행 일시 기록.
3. 줄 수 → 누적 실행 횟수 기록.
4. `history_stats` 맵 생성.

### Step 4 — 건강 점수 계산
1. 각 자동화별 점수 (0~100):
   - Lock CLEAR: +30, RUNNING: +15, STUCK: 0
   - Freshness FRESH: +40, STALE: +20, EXPIRED: +5, MISSING: 0
   - History 존재: +20, 미존재: +10 (이력 없는 자동화도 있음)
   - 잠금 파일 없는 자동화 (A8, A9): Lock +30 고정
2. 전체 건강 점수: 각 자동화 점수의 평균.

### Step 5 — 대시보드 출력 (DRY_RUN이 아닐 때만)
1. `docs/status/AUTOMATION-HEALTH.md` 덮어쓰기:
   ```markdown
   # Automation Health Dashboard — {날짜}

   ## Overall Health: {점수}% ({등급})

   ## Status Table
   | ID | Automation | Lock | Freshness | Last Run | Runs | Score |
   |----|-----------|------|-----------|----------|------|-------|
   | A1 | code-doc-align | CLEAR | FRESH | 2026-03-03 03:30 | 5 | 90 |
   | ... | ... | ... | ... | ... | ... | ... |

   ## Alerts
   - {STUCK 잠금, EXPIRED 산출물, MISSING 산출물 경고}

   ## Recommendations
   - {개선 제안}
   ```

### Step 6 — 잠금 해제

## DRY_RUN=true
- Step 5에서 파일 수정 없이 대시보드 내용만 출력.
- 최종 출력: `[DRY_RUN] 변경 없음`

## 안전 규칙 (MUST)
- `frontend/src/` 코드 파일 절대 수정 금지.
- 다른 자동화의 잠금 파일을 수정하지 않음 (읽기만).
- 다른 자동화의 산출물을 수정하지 않음 (읽기만).
- `AUTOMATION-HEALTH.md`만 쓰기 대상.
- 변경 없으면 최종 출력: `변경 없음`
