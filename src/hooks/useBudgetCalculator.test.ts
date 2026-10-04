// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { useBudgetCalculator } from "./useBudgetCalculator";
afterEach(cleanup);
it("선택한 행에만 가이드 금액을 적용하고 행 삭제·추가가 합계에 반영된다", () => {
  const { result } = renderHook(useBudgetCalculator);
  const first = result.current.rows[0].id;
  act(() => result.current.updateRow(first, { name: "친구 결혼식", amount: "100000" }));
  act(() => result.current.addRow());
  const second = result.current.rows[1].id;
  act(() => result.current.applyGuide(second, { name: "", type: "축의금", amount: 150000, relation: "친구" }));
  expect(result.current.rows[0].name).toBe("친구 결혼식");
  expect(result.current.summary.total).toBe(250000);
  act(() => result.current.removeRow(first));
  expect(result.current.summary.total).toBe(150000);
});
