import { describe, expect, it } from "vitest";
import { applyRecordDelta } from "./recordTotals";

describe("applyRecordDelta", () => {
  it("새 보낸 기록을 합산한다", () => {
    expect(applyRecordDelta(
      { totalPaid: 100_000, totalReceived: 50_000 },
      null,
      { mode: "paid", amount: 30_000 },
    )).toEqual({ totalPaid: 130_000, totalReceived: 50_000 });
  });

  it("금액과 모드가 함께 바뀌어도 양쪽 합계를 조정한다", () => {
    expect(applyRecordDelta(
      { totalPaid: 100_000, totalReceived: 50_000 },
      { mode: "paid", amount: 30_000 },
      { mode: "received", amount: 70_000 },
    )).toEqual({ totalPaid: 70_000, totalReceived: 120_000 });
  });

  it("삭제 시 음수 합계를 만들지 않는다", () => {
    expect(applyRecordDelta(
      { totalPaid: 10_000, totalReceived: 0 },
      { mode: "paid", amount: 20_000 },
      null,
    )).toEqual({ totalPaid: 0, totalReceived: 0 });
  });
});
