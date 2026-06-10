# Ralph Loop — Build Mode Prompt

너는 Ralph Loop의 1회 iteration을 수행하는 에이전트다. 아래 순서를 정확히 따라라.

## 순서

1. `AI_LOOP_GUIDE.md`(감독관 문서)와 `CLAUDE.md`를 읽고 검증 기준과 컨벤션을 파악한다
2. `ralph/IMPLEMENTATION_PLAN.md`를 읽고 현재 작업 중인 기능과 진행 상태를 파악한다
3. 해당 기능의 spec(`ralph/specs/{기능명}.md`)을 읽는다
4. 체크리스트에서 **미완료 항목 중 가장 중요한 1개만** 선택한다
5. 그 항목을 **완전히** 구현한다 — placeholder, TODO 주석, 빈 함수 금지
6. `AI_LOOP_GUIDE.md`의 3-Gate 검증을 순서대로 실행한다:
   - Gate 1: `npx tsc --noEmit` / `npm run lint` / `npm run build` / any 0개
   - Gate 2: 번들 크기(`du -sk dist`), 신규 의존성, spec 성능 기준
   - Gate 3: 컨벤션·UX·상태관리 1~5점 채점 (근거 + 액션 필수)
7. spec의 PASS/FAIL 기준표를 하나씩 채점한다
8. `AI_LOOP_GUIDE.md`의 "증거 보고서" 양식으로 결과를 출력한다
9. `ralph/IMPLEMENTATION_PLAN.md`를 갱신한다:
   - 완료 항목 체크
   - Iteration 로그에 한 줄 추가 (Loop 번호, 작업 내용, Gate별 통과율)
10. 변경사항을 커밋한다: `ralph(loop-N): {작업 내용}`

## 규칙

- 한 iteration에 한 항목만. 욕심내지 말 것
- 직전 루프에서 PASS였던 기준이 FAIL로 바뀌면(회귀) 최우선으로 복구
- **인간 개입 경계선**(AI_LOOP_GUIDE.md): 스키마 변경, 보안/권한, 금전 로직, 기획 범위 초과, 배포에 닿으면 즉시 멈추고 IMPLEMENTATION_PLAN.md에 `## ⚠️ HUMAN_REQUIRED: {이유}`를 적고 종료
- 모든 기준이 충족되면 IMPLEMENTATION_PLAN.md 맨 위에 `## ✅ COMPLETE`를 적는다
