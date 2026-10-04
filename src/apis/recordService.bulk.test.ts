// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toWeddingRecords } from "./weddingLedger";

const database = vi.hoisted(() => new Map<string, Record<string, unknown>>());
const transaction = vi.hoisted(() => ({
  get: vi.fn(async (ref: { path: string }) => ({ exists: () => database.has(ref.path), data: () => database.get(ref.path) })),
  set: vi.fn((ref: { path: string }, value: Record<string, unknown>) => { database.set(ref.path, { ...database.get(ref.path), ...value }); }),
}));
vi.mock("@/utils/firebase", () => ({ db: {}, auth: {} }));
vi.mock("@/utils/toss", () => ({ getStableUserDocumentId: vi.fn(), getTossUserIdentifier: vi.fn() }));
vi.mock("firebase/firestore/lite", () => ({
  doc: (_db: unknown, ...parts: string[]) => ({ path: parts.join("/") }),
  collection: vi.fn(), getDoc: vi.fn(), getDocs: vi.fn(), setDoc: vi.fn(), writeBatch: vi.fn(), DocumentSnapshot: class {},
  runTransaction: async (_db: unknown, callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction),
}));
beforeEach(() => { database.clear(); vi.clearAllMocks(); database.set("users/test", { totalPaid: 50000, totalReceived: 0 }); });

describe("축의금 일괄 저장 트랜잭션", () => {
  it("모든 기존 기록을 먼저 읽고 저장하며 같은 ID 재요청은 합계를 중복 증가시키지 않는다", async () => {
    const { recordService } = await import("./recordService");
    const records = toWeddingRecords([{ id: "1", name: "민수", amount: "100000", relation: "친구" },
      { id: "2", name: "지수", amount: "150000", relation: "직장" }], "2026-10-04");
    await expect(recordService.addRecords("test", records)).resolves.toEqual({ totalPaid: 50000, totalReceived: 250000 });
    const lastRead = Math.max(...transaction.get.mock.invocationCallOrder);
    const firstWrite = Math.min(...transaction.set.mock.invocationCallOrder);
    expect(firstWrite).toBeGreaterThan(lastRead);
    await expect(recordService.addRecords("test", records)).resolves.toEqual({ totalPaid: 50000, totalReceived: 250000 });
    expect(database.size).toBe(3);
  });
  it("빈 목록·인원 초과·잘못된 금액은 DB 접근 전에 거부한다", async () => {
    const { recordService } = await import("./recordService");
    const record = toWeddingRecords([{ id: "1", name: "민수", amount: "100000", relation: "친구" }], "2026-10-04")[0];
    await expect(recordService.addRecords("test", [])).rejects.toThrow();
    await expect(recordService.addRecords("test", [{ ...record, amount: -1 }])).rejects.toThrow();
    await expect(recordService.addRecords("test", Array.from({ length: 26 }, (_, i) => ({ ...record, id: String(i) })))).rejects.toThrow();
    expect(transaction.get).not.toHaveBeenCalled();
  });
});
