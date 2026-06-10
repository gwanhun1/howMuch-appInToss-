# Ralph Loop 상태 파일

> 이 파일은 루프 iteration 간 공유 메모리다. 매 루프 시작 시 읽고, 끝날 때 갱신한다.

## 현재 작업

- **기능**: record-view-toggle — 기록 보기 방식 전환 (카드형 ↔ 리스트형)
- **Spec**: ralph/specs/record-view-toggle.md
- **현재 iteration**: 4 — 🏁 **루프 종료 (성공)**: spec 9/9 PASS, Rubric 10/10, Gate 1~3 전부 통과, 회귀 0
- **모드**: 관전 모드 (팀: ralph-builder[opus] + ralph-evaluator)

## 체크리스트

- [x] 1. `useRecordStore` UISlice에 `viewMode: "card" | "list"` 추가 (기본 `"card"`, setter, partialize 포함) + `ViewModeToggle` 컴포넌트(`components/main/`) 생성 및 MainPage 통합 — ✅ Iteration 1 평가 PASS (6/6)
- [x] 2. `RecordListItem` 리스트 행 컴포넌트 생성 — ✅ Iteration 3 평가 PASS (8/8, 회귀 0, Gate 3: 5/5/5). isUpcoming 시각 강조 활용 + t7 교체로 Gate 1 회복
- [x] 3. `RecordList`에 viewMode 분기 렌더링 — ✅ Iteration 4 최종 평가 PASS (9/9, 카드 그리드 무변경 라인 단위 검증, Gate 3: 5/5/5)

## Iteration 로그

| Loop | 작업 내용 | 통과율 | 비고 |
|---|---|---|---|
| 1 | viewMode UISlice + ViewModeToggle + MainPage 통합 | 6/6 (대상 항목) | Gate 1 전부 PASS, 신규 의존성 0, Gate 3: 5/4/5. spec #3·#5·#6은 PENDING(미착수) |
| 2 | RecordListItem + recordDisplay 유틸 추출 + RecordCard 리팩터 | 4/6 (대상 항목) | **Gate 1 FAIL**: lint 1(미사용 isUpcoming) + build 2(TS6133, t8 TS2322). #4 무회귀 PASS(getRecordDday 로직 동일성 라인 대조 완료), #6 PASS. 교훈: tsc --noEmit은 noUnusedLocals 미적용 — build의 tsc -b가 진짜 게이트 |
| 3 | Task #2 Fix: isUpcoming 시각 강조 연결 + t8→t7 | 8/8 (대상 항목) | Gate 1 회복(빌드/린트 0), 번들 +0%, 회귀 0, Gate 3: 5/5/5. 남은 항목 spec #5만 (Task #3) |
| 4 | RecordList viewMode 분기 + RecordListItemSkeleton + MainPage 연결 | **9/9 (전체)** | 🏁 최종 PASS. Rubric 10/10, 번들 +0.01%, 의존성 0, Gate 3: 5/5/5, 회귀 0, 인간 개입 불필요 |
