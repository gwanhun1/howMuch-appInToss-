# Spec: record-view-toggle — 기록 보기 방식 전환 (카드형 ↔ 리스트형)

## 1. 기능 개요

- **무엇을**: 메인 화면의 기록 그리드(현재 3열 카드, 캐릭터 선택창 느낌)를 유지하면서, 깔끔한 **리스트카드(행) 형태**로도 볼 수 있는 보기 전환 토글을 추가한다.
- **왜**: 기록이 많아지면 카드 그리드는 한눈에 비교가 어렵다. 리스트형은 이름·금액·날짜를 빠르게 스캔할 수 있다.
- **디폴트**: 기존 **카드형(card)**. 사용자가 토글로 **리스트형(list)** 선택 가능, 선택은 영구 저장.
- **범위 제외(Non-goals)**: 정렬/필터 로직 변경 ❌, RecordCard 자체 리디자인 ❌, Firestore 스키마 변경 ❌, 상세 폼/통계 화면 변경 ❌

## 2. PASS/FAIL 기준 (객관적·이진 조건만)

| # | 기준 | 검증 방법 |
|---|---|---|
| 1 | `viewMode: "card" \| "list"` 상태가 `useRecordStore` UISlice에 존재, 기본값 `"card"`, `partialize`에 포함되어 새로고침 후에도 유지된다 | 코드 확인 (`stores/useRecordStore.ts`) |
| 2 | 보기 전환 토글 UI가 메인 화면(기록 리스트 상단 영역)에 존재하고, 현재 모드를 시각적으로 구분하며 `aria-label` 또는 `aria-pressed` 접근성 속성이 있다 | 코드 확인 |
| 3 | 리스트형 행 컴포넌트 `RecordListItem`이 존재한다: 프로필 아이콘 + 이름 + 카테고리 배지 + 금액(우측 정렬) + 즐겨찾기 표시 + D-day 배지를 모두 렌더링 | 코드 확인 (`components/record-card/RecordListItem.tsx`) |
| 4 | `viewMode === "card"`일 때 기존 3열 그리드 렌더링이 **그대로** 유지된다 (회귀 없음 — RecordCard/그리드 스타일 변경 없음) | git diff + 코드 확인 |
| 5 | 리스트형에서도 ① 기록 추가 진입점 ② 무한 스크롤(IntersectionObserver) ③ 로딩 스켈레톤 ④ 빈 상태(EmptyState)가 모두 동작한다 | 코드 확인 |
| 6 | 리스트 행 클릭 시 기존과 동일하게 `onRecordClick`(상세 폼), 즐겨찾기 클릭 시 `onToggleFavorite`이 호출되고 이벤트 버블링이 차단된다 | 코드 확인 |
| 7 | `npx tsc --noEmit` 에러 0개 + 신규 `: any` 0개 | Gate 1 |
| 8 | `npm run lint` 에러 0개, `npm run build` 성공 | Gate 1 |
| 9 | 신규 npm 의존성 0개 (기존 TDS/framer-motion/emotion만 사용) | `git diff package.json` |

## 3. 품질 Rubric (주관 항목 — 8/10 이상 통과)

| 항목 | 기준 |
|---|---|
| 가독성 | 함수 30줄 이하 지향, 변수명 명확, RecordCard와 스타일 작성 방식(inline style + TDS) 일치 |
| 컨벤션 | CLAUDE.md 4계층 패턴 + 기존 `ModeToggle`/`RecordCard` 코드 스타일과 일치 |
| UX | 토스 스타일의 깔끔한 리스트 행 (TDS 컬러 `adaptive.*` 사용, 터치 피드백), 전환 시 레이아웃 깨짐 없음 |

## 4. 검증 명령

```bash
npx tsc --noEmit
npm run lint
npm run build
grep -rn ": any" src/
```

## 5. 기술 제약

- React 18 + TypeScript, Zustand v5 Slice Pattern (UISlice에 추가), TDS Mobile + `@toss/tds-colors`
- 토글 상태는 전역(Zustand persist) — 지역 state 금지 (새로고침 유지 요건)
- 기존 파일 위치 준수: 리스트 행은 `src/components/record-card/`, 토글은 `src/components/main/`
- `partialize`에 `viewMode` 추가 (스토리지 키/버전 변경은 불필요 — 필드 추가만)
