// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

describe("앱 진입 시 바텀시트 상태", () => {
  it("신규 사용자는 메인 화면에서 시작한다", async () => {
    const { useRecordStore } = await import("./useRecordStore");
    expect(useRecordStore.getState()).toMatchObject({
      currentPage: "main", isRecordFormOpen: false, isProfileImageSheetOpen: false,
      editingRecord: null, selectedRecordId: null,
    });
  });

  it("과거 저장값의 폼과 프로필 시트는 복원하지 않고 보기 설정만 복원한다", async () => {
    localStorage.setItem("howmuch-records-storage-v4", JSON.stringify({
      version: 4,
      state: {
        currentMode: "received", viewMode: "list", currentPage: "amountInput",
        isRecordFormOpen: true, isProfileImageSheetOpen: true,
        selectedRecordId: "old", editingRecord: { id: "old" },
        isCelebrating: true,
      },
    }));
    const { useRecordStore } = await import("./useRecordStore");
    expect(useRecordStore.getState()).toMatchObject({
      currentMode: "received", viewMode: "list", currentPage: "main",
      isRecordFormOpen: false, isProfileImageSheetOpen: false,
      selectedRecordId: null, editingRecord: null, isCelebrating: false,
    });
  });

  it("기록 추가를 누른 뒤에만 폼을 열고 금액 화면에서 돌아오면 입력을 유지한다", async () => {
    const { useRecordStore } = await import("./useRecordStore");
    useRecordStore.getState().startAddingRecord("축의금");
    expect(useRecordStore.getState().isRecordFormOpen).toBe(true);
    const draft = useRecordStore.getState().editingRecord;
    useRecordStore.getState().openAmountInput();
    expect(useRecordStore.getState().isRecordFormOpen).toBe(false);
    useRecordStore.getState().closeAmountInput();
    expect(useRecordStore.getState().isRecordFormOpen).toBe(true);
    expect(useRecordStore.getState().editingRecord).toEqual(draft);
    useRecordStore.getState().resetToMain();
    expect(useRecordStore.getState().isRecordFormOpen).toBe(false);
  });
});

describe("가이드에서 기록 입력으로 전환", () => {
  it("받은 마음 보기에서도 보낸 마음 초안을 만들고 저장 전에는 합계를 바꾸지 않는다", async () => {
    const { useRecordStore } = await import("./useRecordStore");
    useRecordStore.setState({ currentMode: "received", totalPaid: 100000, totalReceived: 200000, records: [] });
    useRecordStore.getState().startGuidedRecord({ name: "김민수", relation: "직장", type: "축의금", amount: 150000 });
    expect(useRecordStore.getState()).toMatchObject({ currentMode: "paid", filterType: "전체",
      selectedRecordId: "new", isRecordFormOpen: true, totalPaid: 100000, totalReceived: 200000, records: [],
      editingRecord: { name: "김민수", relation: "직장", type: "축의금", amount: 150000, mode: "paid", date: "" },
    });
    useRecordStore.getState().closeRecordForm();
    expect(useRecordStore.getState().editingRecord).toBeNull();
    expect(useRecordStore.getState().records).toEqual([]);
  });
});
