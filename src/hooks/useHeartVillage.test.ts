// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useHeartVillage } from "./useHeartVillage";
import { loadVillageDecorations } from "@/apis/heartVillage";
import type { MoneyRecord } from "@/types/record";
const records: MoneyRecord[] = Array.from({ length: 8 }, (_, i) => ({
  id: `record-${i}`, name: `이웃${i}`, relation: "친구", mode: "paid", amount: 50000,
  type: "축의금", date: "2026-10-01", profileIcon: "icon-quokka",
}));
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); });
it("6집씩 표시하고 기록이 줄어들면 유효한 구역으로 돌아간다", () => {
  const { result, rerender } = renderHook(({ rows }) => useHeartVillage(rows, "u"), { initialProps: { rows: records } });
  expect(result.current.visibleResidents).toHaveLength(6);
  act(() => result.current.setPage(1));
  expect(result.current.visibleResidents).toHaveLength(2);
  rerender({ rows: records.slice(0, 3) });
  expect(result.current.page).toBe(0);
  expect(result.current.visibleResidents).toHaveLength(3);
});
it("꾸미기·복원·초기화가 원본 기록을 바꾸지 않는다", () => {
  const before = structuredClone(records);
  const { result, unmount } = renderHook(() => useHeartVillage(records, "u"));
  act(() => result.current.selectResident("record-0"));
  act(() => result.current.decorate({ house: "rose" }));
  act(() => result.current.decorate({ icon: "icon-penguin-face" }));
  expect(loadVillageDecorations("u")["record-0"]).toEqual({ house: "rose", icon: "icon-penguin-face" });
  unmount();
  const restored = renderHook(() => useHeartVillage(records, "u"));
  expect(restored.result.current.getDecoration(restored.result.current.residents[0]).house).toBe("rose");
  act(() => restored.result.current.selectResident("record-0"));
  act(() => restored.result.current.resetDecoration());
  expect(loadVillageDecorations("u")).toEqual({});
  expect(records).toEqual(before);
});
it("사용자를 전환하면 이전 꾸미기와 선택을 노출하지 않는다", () => {
  const { result, rerender } = renderHook(({ userId }) => useHeartVillage(records, userId), { initialProps: { userId: "first" } });
  act(() => result.current.selectResident("record-0"));
  act(() => result.current.decorate({ house: "rose" }));
  rerender({ userId: "second" });
  expect(result.current.selected).toBeNull();
  expect(result.current.getDecoration(result.current.residents[0]).house).toBe("sky");
  expect(loadVillageDecorations("second")).toEqual({});
});
it("저장 실패에도 현재 꾸미기는 유지하고 재접속 보존 실패를 알린다", () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
  const { result } = renderHook(() => useHeartVillage(records, "u"));
  act(() => result.current.selectResident("record-0"));
  act(() => result.current.decorate({ house: "forest" }));
  expect(result.current.getDecoration(result.current.residents[0]).house).toBe("forest");
  expect(result.current.storageMessage).toContain("저장하지 못했어요");
});
