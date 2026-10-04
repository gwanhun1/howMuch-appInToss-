import { describe, expect, it } from "vitest";
import { getAmountGuide } from "./index";
import type { GuideSituation } from "./type";

const situation: GuideSituation = { type: "축의금", relation: "직장", closeness: "regular", attending: true };

describe("상황별 금액 가이드", () => {
  it("모든 행사·친밀도·참석 조합에 양수의 중복 없는 선택지를 반환한다", () => {
    for (const type of ["축의금", "조의금", "돌잔치"] as const) {
      for (const closeness of ["acquaintance", "regular", "close"] as const) {
        for (const attending of [true, false]) {
          const result = getAmountGuide({ ...situation, type, closeness, attending });
          expect(result.amounts.length).toBeGreaterThan(0);
          expect(result.amounts.every((n) => Number.isInteger(n) && n > 0)).toBe(true);
          expect(new Set(result.amounts).size).toBe(result.amounts.length);
          expect(result.explanation).not.toMatch(/평균|통계|정답/);
        }
      }
    }
  });
  it("조의금은 조문 여부로 금액 선택지를 바꾸지 않는다", () => {
    const input = { ...situation, type: "조의금" as const };
    expect(getAmountGuide({ ...input, attending: false }).amounts).toEqual(getAmountGuide(input).amounts);
  });
});
