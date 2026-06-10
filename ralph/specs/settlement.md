# Spec: settlement (친구 간 경조사비 정산)

## 1. 기능 개요

- **무엇을**: 친구별로 주고받은 경조사비의 누적 수지를 계산하고, 정산이 필요한 관계를 보여준다
- **왜**: "내가 김철수 결혼식에 10만원 냈는데, 내 결혼식 때 얼마 받았지?"를 한눈에 확인
- **범위 제외(Non-goals)**: 실제 송금 기능, 순환 정산 최적화(A→B→C→A), 푸시 알림

## 2. PASS/FAIL 기준 (객관적·이진 조건만)

| # | 기준 | 검증 방법 |
|---|---|---|
| 1 | 친구별 누적 수지 = (내가 준 합계) - (내가 받은 합계)로 정확히 계산된다 | 샘플 데이터 3건으로 검증 |
| 2 | 수지 기준 내림차순 정렬된 정산 목록이 렌더링된다 | 코드 + 화면 확인 |
| 3 | 로딩/에러/빈 상태 3가지 분기가 모두 처리된다 | 코드 확인 |
| 4 | 4계층 구조 준수 (pages/settlement.tsx, components/Settlement.tsx, hooks/useSettlement.ts, apis/settlement/) | 파일 구조 확인 |
| 5 | any 타입 0개, 모든 API 응답 타입 명시 | `npx tsc --noEmit` + grep "any" |
| 6 | Firestore 쿼리에 userId 필터(auth guard) 포함 | 코드 확인 |

## 3. 품질 Rubric (주관 항목 — 8/10 이상 통과)

| 항목 | 기준 |
|---|---|
| 가독성 | 함수 30줄 이하, 변수명이 도메인 용어와 일치 |
| 컨벤션 | CLAUDE.md 4계층 패턴 및 기존 페이지(Main, Friend) 스타일 일치 |

## 4. 검증 명령

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## 5. 기술 제약

- React 18 + TypeScript, Firebase Firestore, Zustand
- 기존 records 컬렉션 데이터 재사용 (type: 'expense' | 'income')
- Vite alias 사용 (`@components`, `@hooks`, `@apis`)
