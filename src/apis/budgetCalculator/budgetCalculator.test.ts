import { afterEach, describe, expect, it, vi } from "vitest";
import { calculateBudget, getCurrentSeoulMonth, parseExpenseAmount } from "./index";
import type { PlannedExpense } from "./type";
const plan = (id: string, type: PlannedExpense["type"], amount: string): PlannedExpense => ({ id, type, amount, name: "" });
afterEach(() => vi.useRealTimers());

describe("경조사비 예산 계산", () => {
  it("종류별 건수와 예정 합계, 예산 부족액을 계산한다", () => {
    expect(calculateBudget([plan("1", "축의금", "100000"), plan("2", "축의금", "150000"), plan("3", "돌잔치", "50000")], "200000"))
      .toEqual({ total: 300000, counts: { 축의금: 2, 돌잔치: 1 }, invalidIds: [], missingIds: [], remaining: -100000 });
  });
  it("미입력과 잘못된 금액은 구분하고 불완전한 합계를 남은 예산으로 확정하지 않는다", () => {
    expect(calculateBudget([plan("1", "조의금", "50000"), plan("2", "용돈", ""), plan("3", "축의금", "0")], "100000"))
      .toMatchObject({ total: 50000, missingIds: ["2"], invalidIds: ["3"], remaining: null });
  });
  it("소수·음수·지수·범위 밖 금액을 거부한다", () => {
    for (const value of ["", "-1", "0", "1.5", "1e5", "100,000", "100000001", "Infinity"]) expect(parseExpenseAmount(value)).toBeNull();
    expect(parseExpenseAmount("100000000")).toBe(100000000);
    expect(calculateBudget([], "")).toMatchObject({ total: 0, remaining: null });
  });
  it("한국 시간으로 월을 초기화한다", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-09-30T15:00:00Z"));
    expect(getCurrentSeoulMonth()).toBe("2026-10");
  });
});
