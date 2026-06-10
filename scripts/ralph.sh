#!/usr/bin/env bash
# Ralph Loop — 헤드리스 자율 루프
# 사용법: ./scripts/ralph.sh [기능명] [최대 반복 횟수(기본 5)]
set -euo pipefail

FEATURE="${1:?사용법: ./scripts/ralph.sh <기능명> [최대반복]}"
MAX_ITER="${2:-5}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLAN="$ROOT/ralph/IMPLEMENTATION_PLAN.md"
SPEC="$ROOT/ralph/specs/$FEATURE.md"

if [ ! -f "$SPEC" ]; then
  echo "❌ spec 없음: $SPEC"
  echo "   먼저 /ralph $FEATURE 로 spec을 생성하거나 ralph/specs/_TEMPLATE.md를 복사하세요."
  exit 1
fi

echo "🔁 Ralph Loop 시작: $FEATURE (최대 ${MAX_ITER}회)"

for i in $(seq 1 "$MAX_ITER"); do
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Loop $i / $MAX_ITER"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  cat "$ROOT/ralph/PROMPT.md" | claude -p --permission-mode acceptEdits

  if grep -q "✅ COMPLETE" "$PLAN"; then
    echo ""
    echo "🏁 모든 기준 충족 — Loop $i 회에서 완료"
    exit 0
  fi

  if grep -q "⚠️ HUMAN_REQUIRED" "$PLAN"; then
    echo ""
    echo "🙋 인간 개입 경계선 도달 — 루프 중단. IMPLEMENTATION_PLAN.md의 사유를 확인하세요"
    exit 2
  fi
done

echo ""
echo "⛔ 최대 반복(${MAX_ITER}회) 도달 — IMPLEMENTATION_PLAN.md에서 남은 FAIL 항목을 확인하세요"
exit 1
