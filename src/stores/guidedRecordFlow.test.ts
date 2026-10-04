// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchPeople } from "@/hooks/usePeopleSearch";

const addRecord = vi.hoisted(() => vi.fn());
vi.mock("../apis/recordService", () => ({ recordService: { addRecord } }));
beforeEach(() => { localStorage.clear(); vi.resetModules(); addRecord.mockReset(); });

describe("가이드 기록 저장 흐름", () => {
  it("입력 확인 후 저장한 금액은 보낸 합계와 사람별 검색에 반영된다", async () => {
    const { useRecordStore } = await import("./useRecordStore");
    useRecordStore.setState({ userIdentifier: "test-user", records: [], totalPaid: 0, totalReceived: 50000 });
    addRecord.mockResolvedValue({ totalPaid: 150000, totalReceived: 50000 });
    useRecordStore.getState().startGuidedRecord({ name: "김민수", amount: 150000, relation: "직장", type: "축의금" });
    const draft = useRecordStore.getState().editingRecord!;
    await useRecordStore.getState().addRecord({ ...draft, date: "2026-10-04" });
    expect(addRecord).toHaveBeenCalledWith("test-user", expect.objectContaining({ name: "김민수", mode: "paid", amount: 150000 }));
    expect(useRecordStore.getState().totalPaid).toBe(150000);
    expect(useRecordStore.getState().totalReceived).toBe(50000);
    expect(searchPeople(useRecordStore.getState().records, "민수")[0].totalPaid).toBe(150000);
    useRecordStore.getState().closeRecordForm();
  });
  it("저장 실패 시 합계·목록을 복원하고 입력 초안을 유지해 재시도할 수 있다", async () => {
    const { useRecordStore } = await import("./useRecordStore");
    useRecordStore.setState({ userIdentifier: "test-user", records: [], totalPaid: 0, totalReceived: 50000 });
    addRecord.mockRejectedValue(new Error("연결 실패"));
    useRecordStore.getState().startGuidedRecord({ name: "김민수", amount: 100000, relation: "친구", type: "조의금" });
    const draft = useRecordStore.getState().editingRecord!;
    await expect(useRecordStore.getState().addRecord(draft)).rejects.toThrow("연결 실패");
    expect(useRecordStore.getState()).toMatchObject({ records: [], totalPaid: 0, totalReceived: 50000,
      isRecordFormOpen: true, editingRecord: draft });
  });
});
