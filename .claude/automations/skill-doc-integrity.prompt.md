# skill-doc-integrity — 스킬↔문서↔코드 정합성 검사

## 메타
- **작업명**: DangApp 스킬 파일 정합성 자동 검사
- **스케줄**: 매일 03:00 (Asia/Seoul)
- **역할**: SKILL-DOC-MATRIX 경로 vs 디스크, Board 스킬 참조 vs 실제 스킬 파일, 스킬 내부 코드 경로 참조 검증
- **프로젝트 루트**: `C:\Users\gmdqn\dangapp`

## 검증 대상
```
SKILL-DOC-MATRIX.md (스킬 → 코드/문서 매핑)
  ↕ 검증
.claude/skills/**/*.md (실제 스킬 파일)
  ↕ 검증
PAGE-UPGRADE-BOARD.md (page_skill + support_skills 컬럼)
  ↕ 검증
frontend/src/ (스킬이 참조하는 코드 경로)
```

## 잠금
- 잠금 파일: `docs/status/.skill-doc-integrity.lock`
- 시작 시: `{"status":"running","started_at":"<ISO>"}`
- 종료 시: `{"status":"released","released_at":"<ISO>"}`

## 절차

### Step 0 — Pre-check
1. 잠금 파일 확인/생성.
2. `DRY_RUN` 플래그 확인.

### Step 1 — SKILL-DOC-MATRIX 파싱
1. `docs/status/SKILL-DOC-MATRIX.md` 테이블 파싱.
2. 각 행에서 추출:
   - `skill_name`: 스킬 식별자
   - `skill_path`: 스킬 파일 경로
   - `code_paths`: 관련 코드 파일 경로 목록
   - `doc_paths`: 관련 문서 파일 경로 목록
3. `matrix_entries` 리스트 생성.

### Step 2 — 디스크 스킬 파일 스캔
1. `.claude/skills/` 하위 모든 `.md` 파일 재귀 수집 → `disk_skills` 집합.
2. Matrix에 있지만 디스크에 없는 스킬 → `MISSING_SKILL` 리스트.
3. 디스크에 있지만 Matrix에 없는 스킬 → `UNTRACKED_SKILL` 리스트.

### Step 3 — Board 스킬 참조 검증
1. `PAGE-UPGRADE-BOARD.md` 파싱.
2. 각 라우트의 `page_skill` + `support_skills` 컬럼에서 스킬명 추출 → `board_skills` 집합.
3. Board에서 참조하지만 디스크에 없는 스킬 → `BOARD_DANGLING` 리스트.
4. Board에서 참조하지만 Matrix에 없는 스킬 → `BOARD_UNMATRIX` 리스트.

### Step 4 — 스킬 내부 코드 경로 검증
1. 각 디스크 스킬 파일 (.md) 읽기.
2. 파일 내에서 코드 경로 패턴 추출:
   - `frontend/src/...` 패턴의 파일 경로
   - `Read First`, `Input Context`, `Output` 섹션의 경로
3. 추출된 각 경로가 실제 디스크에 존재하는지 확인.
4. 존재하지 않는 경로 → `BROKEN_PATH` 리스트 (스킬 파일명 + 깨진 경로).

### Step 5 — 스킬 콘텐츠 품질 검사
1. 각 스킬 파일에서 필수 섹션 존재 여부 확인:
   - page 스킬: `Trigger`, `Input Context`, `Read First`, `Do`, `Validation`, `Output`
   - feature 스킬: `Trigger`, `Inputs`, `Procedure`, `Validation`, `Output`
2. 필수 섹션 누락 → `INCOMPLETE_SKILL` 리스트.

### Step 6 — 보고서 출력 (DRY_RUN이 아닐 때만)
1. `docs/status/SKILL-DOC-INTEGRITY-REPORT.md` 덮어쓰기:
   ```markdown
   # Skill-Doc Integrity Report — {날짜}

   ## Summary
   | Check | Count |
   |-------|-------|
   | Missing skills (Matrix → Disk) | N |
   | Untracked skills (Disk → Matrix) | N |
   | Board dangling refs | N |
   | Board unmatrix refs | N |
   | Broken code paths in skills | N |
   | Incomplete skills | N |

   ## Missing Skills
   (Matrix에 등록되었지만 디스크에 없는 스킬)

   ## Untracked Skills
   (디스크에 있지만 Matrix에 등록되지 않은 스킬)

   ## Board Dangling References
   (Board에서 참조하지만 실제 파일 없는 스킬)

   ## Broken Code Paths
   | Skill File | Broken Path |
   |-----------|-------------|
   | ... | ... |

   ## Incomplete Skills
   | Skill File | Missing Sections |
   |-----------|-----------------|
   | ... | ... |
   ```

### Step 7 — 잠금 해제

## DRY_RUN=true
- Step 6에서 파일 수정 없이 보고서 내용만 출력.
- 최종 출력: `[DRY_RUN] 변경 없음`

## 안전 규칙 (MUST)
- `frontend/src/` 코드 파일 절대 수정 금지.
- 스킬 파일 자동 수정 금지 (보고만).
- SKILL-DOC-MATRIX 자동 수정 금지 (보고만).
- Board 자동 수정 금지 (보고만).
- 변경 없으면 최종 출력: `변경 없음`
