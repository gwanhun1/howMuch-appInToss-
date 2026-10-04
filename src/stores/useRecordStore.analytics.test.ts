// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from "vitest";
import { useRecordStore } from "./useRecordStore";
import type { MoneyRecord } from "@/types/record";

const service = vi.hoisted(() => ({ addRecord: vi.fn(), addRecords: vi.fn(), updateRecord: vi.fn() }));
const track = vi.hoisted(() => vi.fn());
vi.mock("@/apis/recordService", () => ({ recordService: service }));
vi.mock("@/apis/growthAnalytics", () => ({ trackRecordSaved: track }));
const record: MoneyRecord = { id: "test-record", mode: "received", name: "비공개 이름", amount: 100000,
  date: "2026-10-04", relation: "비공개 관계", type: "축의금", profileIcon: "icon-face-cap" };
beforeEach(() => {
  vi.resetAllMocks();
  useRecordStore.setState({ records: [], totalPaid: 0, totalReceived: 0, userIdentifier: "test", isLoading: false, error: null });
});

it("단건 저장이 완료되기 전과 실패 시에는 전환을 기록하지 않는다", async () => {
  let finish: ((totals: { totalPaid: number; totalReceived: number }) => void) | undefined;
  service.addRecord.mockReturnValueOnce(new Promise((resolve) => { finish = resolve; }));
  const pending = useRecordStore.getState().addRecord(record);
  expect(track).not.toHaveBeenCalled();
  await vi.waitFor(() => expect(service.addRecord).toHaveBeenCalledOnce());
  finish?.({ totalPaid: 0, totalReceived: 100000 });
  await pending;
  expect(track.mock.calls).toEqual([["single"]]);
  track.mockClear();
  service.addRecord.mockRejectedValueOnce(new Error("저장 실패"));
  await expect(useRecordStore.getState().addRecord({ ...record, id: "second" })).rejects.toThrow("저장 실패");
  expect(track).not.toHaveBeenCalled();
});

it("일괄 저장은 성공 후 한 번 집계하며 이미 반영된 ID 재시도는 제외한다", async () => {
  service.addRecords.mockRejectedValueOnce(new Error("저장 실패"));
  await expect(useRecordStore.getState().addRecords([record])).rejects.toThrow("저장 실패");
  expect(track).not.toHaveBeenCalled();
  service.addRecords.mockResolvedValue({ totalPaid: 0, totalReceived: 100000 });
  await useRecordStore.getState().addRecords([record]);
  await useRecordStore.getState().addRecords([record]);
  expect(track.mock.calls).toEqual([["wedding_ledger"]]);
});

it("기존 기록 수정은 새 기록 저장 전환으로 집계하지 않는다", async () => {
  useRecordStore.setState({ records: [record], totalReceived: record.amount });
  service.updateRecord.mockResolvedValue({ totalPaid: 0, totalReceived: 150000 });
  await useRecordStore.getState().updateRecord(record.id, { amount: 150000 });
  expect(track).not.toHaveBeenCalled();
});
