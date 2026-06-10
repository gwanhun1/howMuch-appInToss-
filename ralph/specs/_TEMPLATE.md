# Spec: {기능명}

## 1. 기능 개요

- **무엇을**: (한 문장)
- **왜**: (사용자 가치 한 문장)
- **범위 제외(Non-goals)**: (이번 루프에서 안 할 것)

## 2. PASS/FAIL 기준 (객관적·이진 조건만)

| # | 기준 | 검증 방법 |
|---|---|---|
| 1 | (예: 친구별 누적 수지가 정확히 계산된다 — 준 합계 - 받은 합계) | 단위 테스트 / 콘솔 검증 |
| 2 | (예: 로딩/에러/빈 상태 3가지 분기가 모두 렌더링된다) | 코드 확인 |
| 3 | (예: any 타입 0개) | `npx tsc --noEmit` + grep |
| 4 | (예: 4계층 구조 준수 — pages/components/hooks/apis) | 파일 구조 확인 |

## 3. 품질 Rubric (주관 항목 — 8/10 이상 통과)

| 항목 | 기준 |
|---|---|
| 가독성 | 함수 30줄 이하, 변수명 명확 |
| 컨벤션 | CLAUDE.md 패턴 일치 |

## 4. 검증 명령

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## 5. 기술 제약

- React 18 + TypeScript, Firebase Firestore, Zustand
- 4계층 구조: `pages/` → `components/` → `hooks/` → `apis/`
- Vite alias 사용 (`@components`, `@hooks`, `@apis`)
