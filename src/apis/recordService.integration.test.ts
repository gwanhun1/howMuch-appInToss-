import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { initializeApp, deleteApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore/lite";
import { randomUUID } from "node:crypto";
import type { MoneyRecord } from "../types/record";

// 명시적으로 실행한 로컬 검증에서만 사용합니다. 운영 환경에 연결하지 않습니다.
describe.runIf(process.env.HOWMUCH_EMULATOR_TEST === "true")("Firestore Lite 保存・再取得", () => {
  let app: FirebaseApp;
  let service: typeof import("./recordService").recordService;
  let uid: string;
  const record: MoneyRecord = {
    id: randomUUID(), mode: "paid", name: "연결 검증", amount: 100000,
    type: "축의금", profileIcon: "icon-face-cap", relation: "", date: "",
  };

  beforeAll(async () => {
    app = initializeApp({ projectId: "demo-howmuch-review", apiKey: "fake-api-key" }, randomUUID());
    const db = getFirestore(app);
    const auth = getAuth(app);
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    vi.doMock("@/utils/firebase", () => ({ db, auth }));
    vi.doMock("@/utils/toss", () => ({
      getTossUserIdentifier: async () => "emulator-only",
      getStableUserDocumentId: async () => `key_${record.id.replaceAll("-", "").repeat(2)}`,
    }));
    service = (await import("./recordService")).recordService;
    ({ uid } = await service.authenticate());
    await service.getOrCreateUser(uid, "emulator-only");
  });

  afterAll(async () => { if (app) await deleteApp(app); });

  it("인증 후 기록을 저장·조회·수정·삭제하고 합계를 유지한다", async () => {
    await expect(service.addRecord(uid, record)).resolves.toEqual({totalPaid: 100000, totalReceived: 0});
    const first = await service.fetchRecordsPage(uid);
    expect(first.fetchedRecords).toHaveLength(1);
    expect(first.fetchedRecords[0]).toMatchObject(record);
    await expect(service.updateRecord(uid, record.id, {mode: "received", amount: 200000}))
      .resolves.toEqual({totalPaid: 0, totalReceived: 200000});
    expect((await service.fetchRecordsPage(uid)).fetchedRecords[0].amount).toBe(200000);
    await expect(service.removeRecord(uid, record.id)).resolves.toEqual({totalPaid: 0, totalReceived: 0});
    expect((await service.fetchRecordsPage(uid)).fetchedRecords).toEqual([]);
  });
});
