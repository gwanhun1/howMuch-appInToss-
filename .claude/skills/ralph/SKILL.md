---
name: ralph
description: Ralph Loop — spec의 PASS/FAIL 기준을 모두 충족할 때까지 Execute→Evaluate→Fix를 반복해 기능을 구현한다
---

# /ralph [기능명 또는 spec 파일 경로]

스펙에 정의된 **객관적 PASS/FAIL 기준**을 100% 충족할 때까지
`Execute → Evaluate → Fix → Repeat` 루프를 도는 자율 구현 기법.

`/score`(3개 구현 중 최고 선택)와 달리, `/ralph`는 **하나의 구현을 기준 충족까지 반복 개선**한다.

## 전체 흐름

```
spec 확인 (없으면 Phase 0에서 생성)
      ↓
┌─→ [Execute]  IMPLEMENTATION_PLAN.md에서 미완료 항목 중 가장 중요한 1개 선택 → 완전히 구현
│         ↓
│   [Evaluate] 검증 명령 실행 + spec의 PASS/FAIL 기준 채점
│         ↓
│   [Fix]      FAIL 항목 수정, IMPLEMENTATION_PLAN.md 갱신
│         ↓
└── [Repeat]   모든 기준 PASS? ─ No → 루프 계속
                       │
                      Yes
                       ↓
              최종 리포트 출력 + 루프 종료
```

## Phase 0: Spec 생성 (spec이 없을 때만)

`ralph/specs/{기능명}.md` 가 없으면 사용자 요구사항을 기반으로 먼저 작성한다.
템플릿: `ralph/specs/_TEMPLATE.md`

spec에 반드시 포함할 것:
1. **기능 개요** — 무엇을, 왜
2. **PASS/FAIL 기준** — 객관적·이진(binary) 조건만. "좋은 UI" ❌ → "로딩/에러/빈 상태 3가지 분기 렌더링" ✅
3. **품질 rubric** — 주관 항목은 10점 만점 채점, 8점 이상 통과
4. **검증 명령** — 어떤 명령으로 기계 검증할지

spec 작성 후 `ralph/IMPLEMENTATION_PLAN.md`에 작업 체크리스트를 생성하고 루프를 시작한다.

## 루프 규칙 (매 iteration 공통)

1. **시작 시 반드시 읽기**: `AI_LOOP_GUIDE.md`(감독관 문서) + `ralph/specs/{기능명}.md` + `ralph/IMPLEMENTATION_PLAN.md` + `CLAUDE.md`
2. **한 번에 하나**: 미완료 항목 중 가장 중요한 **1개만** 골라 완전히 구현 (placeholder/TODO 금지)
3. **Evaluate 단계 — `AI_LOOP_GUIDE.md`의 3-Gate 검증을 순서대로 실행**:
   - **Gate 1 (필수)**: `npx tsc --noEmit` / `npm run lint` / `npm run build` / any 0개 — 전부 PASS여야 다음 Gate
   - **Gate 2 (정량)**: 번들 크기, 신규 의존성, spec 성능 기준
   - **Gate 3 (정성)**: 컨벤션·UX·상태관리 1~5점 자가 채점 — 점수마다 근거(Evidence)와 액션(Action) 필수, 4점 미만이면 Action 실행 후 재채점
   - 추가로 spec의 PASS/FAIL 기준표를 하나씩 채점한다
4. **인간 개입 경계선 체크**: 작업이 `AI_LOOP_GUIDE.md`의 경계선(스키마 변경, 보안/권한, 금전 로직, 기획 범위 초과, 배포)에 닿으면 즉시 멈추고 보고 후 대기
5. **결과 기록**: `ralph/IMPLEMENTATION_PLAN.md`에 iteration 번호, Gate별 현황, 다음 할 일을 갱신
6. **매 iteration 끝마다 `AI_LOOP_GUIDE.md`의 "증거 보고서" 양식으로 중간 리포트** 출력 (Gate 1/2/3 + 인간 개입 필요 여부)

## 종료 조건

- ✅ **성공**: Gate 1 전부 PASS + Gate 2 임계치 내 + Gate 3 전 항목 4/5 이상 + spec 기준 100% 충족
- ⛔ **안전장치**: 최대 **5회** iteration. 5회에도 미충족이면 중단하고 남은 FAIL 항목과 원인 분석을 보고한다
- ⛔ **회귀 감지**: 직전 루프에서 PASS였던 항목이 FAIL로 바뀌면 즉시 보고

## 최종 리포트 형식

```
# 🏁 Ralph Loop 완료: {기능명}

- 총 iteration: N회
- 기준 충족: Y/Y (100%)
- 통과율 추이: 60% → 80% → 100%
- 생성/수정 파일: [목록]
- 기계 검증: tsc ✅ / lint ✅ / build ✅

## Iteration 히스토리
| Loop | 작업 내용 | 통과율 |
|---|---|---|
| 1 | ... | 3/5 |
| 2 | ... | 4/5 |
| 3 | ... | 5/5 |
```

## 실행 모드 선택

**기본 (단독 루프)**: 사용자가 별도 언급 없으면 메인 세션이 혼자 Execute→Evaluate→Fix를 반복한다. 빠르고 토큰이 적게 든다.

**관전 모드 (에이전트 팀)**: 사용자가 "보면서", "관전", "팀으로", "tmux" 등을 언급하면 **에이전트 팀**으로 실행한다. 역할을 분리해 셀프 채점을 방지한다:

| 팀원 | 모델 | 역할 |
|---|---|---|
| `ralph-builder` | **opus** (생성 시 model: opus 지정) | 구현 전담. 체크리스트에서 1개 항목 골라 완전히 구현. **자기 채점 금지** |
| `ralph-evaluator` | 메인 세션 상속 (기본) | 검증 전담. tsc/lint/build 실행 + spec PASS/FAIL 기준 채점. **코드 수정 금지** |
| 리더 (메인 세션) | 사용자 설정 모델 | 루프 오케스트레이션. evaluator의 FAIL 리포트를 builder에게 전달, IMPLEMENTATION_PLAN.md 갱신, 종료 판정 |

관전 모드 루프:
```
리더: builder에게 "항목 N 구현해" 지시
  → builder: 구현 완료 보고
  → 리더: evaluator에게 "채점해" 지시
  → evaluator: PASS/FAIL 리포트 (FAIL 사유 명시)
  → 리더: FAIL 있으면 builder에게 수정 지시 (루프 계속)
  → 전부 PASS면 팀 정리 후 최종 리포트
```

- tmux 세션 안에서 실행 중이면 팀원별 분할 창이 자동으로 열려 각자의 작업을 실시간 관전할 수 있다
- 완료 후 반드시 팀을 정리한다 (팀원 종료 → cleanup)

## 헤드리스 모드 (선택)

터미널에서 자율 루프로 돌리고 싶으면:
```bash
./scripts/ralph.sh {기능명}        # 최대 5회 반복, ralph/PROMPT.md 사용
```

## 사용 예시

```
/ralph settlement                       # 단독 루프
/ralph settlement 팀으로 돌려줘. 보면서 할래   # 관전 모드 (builder + evaluator 분할 창)
/ralph "경조사 카테고리 필터링"           # spec이 없으면 Phase 0부터
```
