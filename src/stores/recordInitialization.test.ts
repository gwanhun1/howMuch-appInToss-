// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const service = vi.hoisted(() => ({
  authenticate: vi.fn(), getOrCreateUser: vi.fn(), fetchRecordsPage: vi.fn(),
  migrateLegacyData: vi.fn(),
}));
vi.mock("../apis/recordService", () => ({ recordService: service }));

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
  vi.resetAllMocks();
  service.authenticate.mockResolvedValue({ uid: "test-user", tossId: "test-toss" });
  service.getOrCreateUser.mockResolvedValue({ totalPaid: 0, totalReceived: 50000, totalAmount: 50000 });
  service.fetchRecordsPage.mockResolvedValue({ fetchedRecords: [], lastVisible: null });
});
afterEach(() => vi.useRealTimers());

describe("초기 연결 지연과 재시도", () => {
  it("중복 진입은 진행 중인 한 요청을 공유한다", async () => {
    const { useRecordStore } = await import("./useRecordStore");
    const first = useRecordStore.getState().initializeStore();
    const second = useRecordStore.getState().initializeStore();
    expect(second).toBe(first);
    await first;
    expect(service.authenticate).toHaveBeenCalledOnce();
    expect(service.fetchRecordsPage).toHaveBeenCalledOnce();
    expect(useRecordStore.getState()).toMatchObject({
      totalPaid: 0, totalReceived: 50000, isLoading: false, error: null,
    });
  });

  it("5초 이상 걸리면 지연을 안내하고 늦게 도착한 성공 응답을 반영한다", async () => {
    vi.useFakeTimers();
    let resolveAuth!: (result: { uid: string; tossId: string }) => void;
    service.authenticate.mockReturnValue(new Promise(resolve => { resolveAuth = resolve; }));
    const { useRecordStore } = await import("./useRecordStore");
    const request = useRecordStore.getState().initializeStore();
    await vi.advanceTimersByTimeAsync(5001);
    expect(useRecordStore.getState()).toMatchObject({isLoading: true, isLoadingSlow: true, error: null});
    resolveAuth({ uid: "test-user", tossId: "test-toss" });
    await request;
    expect(useRecordStore.getState()).toMatchObject({isLoading: false, isLoadingSlow: false, error: null});
    expect(vi.getTimerCount()).toBe(0);
  });

  it("실패 후 재시도할 수 있고 기존 기록을 지우지 않는다", async () => {
    const { useRecordStore } = await import("./useRecordStore");
    await useRecordStore.getState().initializeStore();
    service.authenticate.mockRejectedValueOnce(new Error("사용자 연결 시간이 초과되었어요."));
    await useRecordStore.getState().initializeStore();
    expect(useRecordStore.getState().totalReceived).toBe(50000);
    expect(useRecordStore.getState().error).toContain("사용자 연결");
    await useRecordStore.getState().initializeStore();
    expect(useRecordStore.getState().error).toBeNull();
    expect(service.authenticate).toHaveBeenCalledTimes(3);
  });

  it("구버전 기록 변환이 끝난 후 새 기록 목록을 다시 조회한다", async () => {
    service.getOrCreateUser.mockResolvedValue({ friends: [], totalPaid: 0, totalReceived: 0 });
    service.migrateLegacyData.mockResolvedValue({ totalAmount: 10000 });
    const { useRecordStore } = await import("./useRecordStore");
    await useRecordStore.getState().initializeStore();
    expect(service.fetchRecordsPage).toHaveBeenCalledTimes(2);
    expect(useRecordStore.getState().totalPaid).toBe(10000);
  });
});
