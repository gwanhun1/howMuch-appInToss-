// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useWeddingLedger } from "./useWeddingLedger";
import { useRecordStore } from "@/stores/useRecordStore";
const saveRecords = vi.hoisted(() => vi.fn());
vi.mock("@/apis/recordService", () => ({ recordService: { addRecords: saveRecords } }));
beforeEach(() => {
  saveRecords.mockReset();
  useRecordStore.setState({ records: [], totalPaid: 50000, totalReceived: 0, userIdentifier: "test", isLoading: false, error: null });
});
afterEach(cleanup);
function fillFirst(result: { current: ReturnType<typeof useWeddingLedger> }) {
  const id = result.current.guests[0].id;
  act(() => { result.current.setDate("2026-10-04"); result.current.updateGuest(id, { name: "민수", amount: "100000", relation: "친구" }); });
  return id;
}
it("두 번 누른 저장은 한 요청으로 처리하고 성공 시 기존 받은 내역에 병합한다", async () => {
  saveRecords.mockResolvedValue({ totalPaid: 50000, totalReceived: 100000 });
  const { result } = renderHook(useWeddingLedger); fillFirst(result);
  await act(async () => { const first = result.current.save(); const second = result.current.save(); await Promise.all([first, second]); });
  expect(saveRecords).toHaveBeenCalledOnce();
  expect(useRecordStore.getState().totalPaid).toBe(50000);
  expect(result.current.ledger).toHaveLength(1);
  expect(result.current.guests[0].name).toBe("");
});
it("실패 후 입력·ID를 유지하며 재시도에서 같은 ID를 사용한다", async () => {
  saveRecords.mockRejectedValueOnce(new Error("연결 실패")).mockResolvedValueOnce({ totalPaid: 50000, totalReceived: 100000 });
  const { result } = renderHook(useWeddingLedger); const id = fillFirst(result);
  await act(async () => { await result.current.save(); });
  expect(result.current.error).toBe("연결 실패");
  expect(result.current.guests[0].id).toBe(id);
  expect(useRecordStore.getState().records).toEqual([]);
  await act(async () => { await result.current.save(); });
  expect(saveRecords.mock.calls[0][1][0].id).toBe(saveRecords.mock.calls[1][1][0].id);
});
it("CSV는 저장하지 않고 입력에 추가하며 중복은 확인 전까지 저장을 막는다", () => {
  const { result } = renderHook(useWeddingLedger);
  act(() => { result.current.setDate("2026-10-04"); });
  act(() => result.current.importCsv("이름,금액,관계\n민수,100000,친구\n민수,100000,친구"));
  expect(result.current.guests).toHaveLength(2);
  expect(result.current.duplicates).toHaveLength(2);
  expect(result.current.canSave).toBe(false);
  expect(saveRecords).not.toHaveBeenCalled();
  act(() => result.current.setAllowDuplicates(true));
  expect(result.current.canSave).toBe(true);
  act(() => result.current.updateGuest(result.current.guests[0].id, { amount: "150000" }));
  expect(result.current.allowDuplicates).toBe(false);
  expect(result.current.duplicates).toEqual([]);
});
