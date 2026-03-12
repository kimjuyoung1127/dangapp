#!/usr/bin/env bash
# pre-commit-check.sh — 코딩 패턴 드리프트 방지 검증
# 규칙 원본: docs/ref/code-patterns.md
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WARNINGS=0
ERRORS=0

# staged .tsx/.ts/.jsx/.js 파일만 대상
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR -- '*.tsx' '*.ts' '*.jsx' '*.js' 2>/dev/null || true)

if [ -z "$STAGED_FILES" ]; then
  echo "pre-commit: no staged source files — skipping pattern check."
  exit 0
fi

echo "=== DangApp Pre-Commit Pattern Check ==="

# ─── 1. 디자인 토큰 위반 검사 ───────────────────────────────
# className 내 임의값 패턴 검출
check_arbitrary_values() {
  local file="$1"
  local content
  content=$(git show ":$file" 2>/dev/null) || return 0

  # rounded-[...] 임의 radius
  if echo "$content" | grep -Pn 'rounded-\[' >/dev/null 2>&1; then
    echo "  WARN: $file — arbitrary radius (rounded-[...]). Use config tokens (rounded-xl, rounded-3xl)."
    ((WARNINGS++)) || true
  fi

  # text-[Npx] / text-[Nrem] 임의 font size
  if echo "$content" | grep -Pn 'text-\[\d+' >/dev/null 2>&1; then
    echo "  WARN: $file — arbitrary font size (text-[...]). Use Tailwind text-* scale."
    ((WARNINGS++)) || true
  fi

  # shadow-[...] 임의 shadow
  if echo "$content" | grep -Pn 'shadow-\[' >/dev/null 2>&1; then
    echo "  WARN: $file — arbitrary shadow (shadow-[...]). Define in tailwind.config.ts."
    ((WARNINGS++)) || true
  fi

  # bg-[#...] / text-[#...] / border-[#...] 하드코딩 hex in className
  if echo "$content" | grep -Pn '(bg|text|border|ring|outline)-\[#[0-9a-fA-F]' >/dev/null 2>&1; then
    echo "  WARN: $file — hardcoded hex color in className. Use semantic tokens."
    ((WARNINGS++)) || true
  fi
}

# ─── 2. 컴포넌트 파일 네이밍 검증 ───────────────────────────
check_component_naming() {
  local file="$1"
  local basename
  basename=$(basename "$file")

  # .tsx 파일이 components/ 아래에 있으면 PascalCase 확인
  if [[ "$file" == *"/components/"* && "$basename" == *.tsx ]]; then
    local name="${basename%.tsx}"
    if [[ ! "$name" =~ ^[A-Z][a-zA-Z0-9]*$ ]]; then
      # page.tsx, layout.tsx 등 Next.js 예약 파일 제외
      if [[ "$name" != "page" && "$name" != "layout" && "$name" != "loading" && "$name" != "error" && "$name" != "not-found" && "$name" != "index" ]]; then
        echo "  WARN: $file — component file should be PascalCase."
        ((WARNINGS++)) || true
      fi
    fi
  fi
}

# ─── 3. 직접 Supabase 호출 검사 ─────────────────────────────
check_direct_supabase() {
  local file="$1"
  local content
  content=$(git show ":$file" 2>/dev/null) || return 0

  # components/ 내에서 createClient + .from( 조합 감지
  if [[ "$file" == *"/components/"* ]]; then
    if echo "$content" | grep -P 'createClient\(\)' >/dev/null 2>&1; then
      if echo "$content" | grep -P '\.from\(' >/dev/null 2>&1; then
        echo "  WARN: $file — direct Supabase call in component. Use a data hook instead."
        ((WARNINGS++)) || true
      fi
    fi
  fi
}

# ─── 4. 크로스 폴더 상대 import 검사 ────────────────────────
check_relative_imports() {
  local file="$1"
  local content
  content=$(git show ":$file" 2>/dev/null) || return 0

  # ../../ 이상의 깊은 상대 import 감지
  if echo "$content" | grep -Pn "from ['\"]\.\.\/\.\.\/" >/dev/null 2>&1; then
    echo "  WARN: $file — deep relative import detected. Use @/ alias for cross-folder imports."
    ((WARNINGS++)) || true
  fi
}

# ─── 실행 ────────────────────────────────────────────────────
for file in $STAGED_FILES; do
  # 파일이 실제로 staged에 존재하는지 확인
  git show ":$file" >/dev/null 2>&1 || continue

  check_arbitrary_values "$file"
  check_component_naming "$file"
  check_direct_supabase "$file"
  check_relative_imports "$file"
done

# ─── 결과 출력 ───────────────────────────────────────────────
echo ""
if [ "$WARNINGS" -gt 0 ]; then
  echo "Pattern check: $WARNINGS warning(s) found."
  echo "See docs/ref/code-patterns.md for the full coding rules."
  echo ""
  # 경고만 — 커밋은 차단하지 않음 (팀 합의 후 blocking으로 전환 가능)
  # exit 1
fi

echo "pre-commit pattern check done."
exit 0
