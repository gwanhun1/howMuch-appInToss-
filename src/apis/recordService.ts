import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
  runTransaction,
  DocumentSnapshot,
} from "firebase/firestore/lite";
import { signInAnonymously, type UserCredential } from "firebase/auth";
import { auth, db } from "@/utils/firebase";
import {
  getStableUserDocumentId,
  getTossUserIdentifier,
} from "@/utils/toss";
import { applyRecordDelta, type RecordTotals } from "@/utils/recordTotals";
import type { MoneyRecord } from "../types/record";
import { withRequestTimeout, RequestTimeoutError } from "../utils/requestTimeout";

let anonymousSignIn: Promise<UserCredential> | null = null;
function signInOnce() {
  if (!anonymousSignIn) {
    anonymousSignIn = signInAnonymously(auth).finally(() => { anonymousSignIn = null; });
  }
  return anonymousSignIn;
}

const ERROR_MESSAGES: Record<string, string> = {
  unavailable: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
  "network-request-failed": "네트워크 연결에 실패했습니다.",
  "permission-denied": "접근 권한이 없습니다.",
  unauthenticated: "로그인이 필요합니다.",
  "not-found": "데이터를 찾을 수 없습니다.",
  "already-exists": "이미 존재하는 데이터입니다.",
  "resource-exhausted": "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
  cancelled: "요청이 취소되었습니다.",
  internal: "서버 오류가 발생했습니다.",
  "invalid-argument": "잘못된 요청입니다.",
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (
      error.message.includes("인터넷") ||
      error.message.includes("시간이 초과")
    ) {
      return error.message;
    }
    const firebaseError = error as { code?: string };
    if (firebaseError.code) {
      const code = firebaseError.code
        .replace("auth/", "")
        .replace("firestore/", "");
      return ERROR_MESSAGES[code] || "오류가 발생했습니다. 다시 시도해주세요.";
    }
    return error.message;
  }
  return "알 수 없는 오류가 발생했습니다.";
}

function checkOnline(): void {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new Error("인터넷 연결이 없습니다. 네트워크 상태를 확인해주세요.");
  }
}

function throwUserFriendlyError(error: unknown): never {
  if (error instanceof RequestTimeoutError) throw error;
  const code = error instanceof Error && "code" in error ? error.code : "unknown";
  // 사용자 식별자/기록/토큰 없이 실패 종류만 남깁니다.
  console.error("[recordService] 요청 실패", { code });
  throw new Error(getErrorMessage(error));
}

export interface UserMetadata {
  tossId: string;
  createdAt: string;
  totalAmount: number;
  totalPaid: number;
  totalReceived: number;
  friends?: MoneyRecord[]; // 레거시 마이그레이션용
}

export const recordService = {
  async authenticate() {
    try {
      checkOnline();
      const [tossId] = await Promise.all([
        getTossUserIdentifier(),
        withRequestTimeout(auth.authStateReady(), "사용자 연결 준비"),
      ]);
      const user = auth.currentUser ?? (await withRequestTimeout(signInOnce(), "사용자 연결")).user;
      const uid = await getStableUserDocumentId(tossId);
      await this.migrateAnonymousAccount(user.uid, uid, tossId);
      return { uid, tossId };
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  async migrateAnonymousAccount(
    legacyUid: string,
    stableUid: string,
    tossId: string,
  ) {
    if (legacyUid === stableUid) return;

    const legacyUserRef = doc(db, "users", legacyUid);
    const legacyUser = await withRequestTimeout(getDoc(legacyUserRef), "기존 기록 확인");
    if (!legacyUser.exists()) return;
    if (legacyUser.data().migratedToUid === stableUid) return;

    const stableUserRef = doc(db, "users", stableUid);
    const legacyRecords = await withRequestTimeout(
      getDocs(collection(db, "users", legacyUid, "records")),
      "기존 기록 불러오기",
    );

    // Firestore batch 한도에 여유를 두고 기존 기록을 새 고정 경로로 병합합니다.
    const chunks: Array<typeof legacyRecords.docs> = [];
    for (let index = 0; index < legacyRecords.docs.length; index += 400) {
      chunks.push(legacyRecords.docs.slice(index, index + 400));
    }
    if (chunks.length === 0) chunks.push([]);

    for (let index = 0; index < chunks.length; index += 1) {
      const batch = writeBatch(db);
      if (index === 0) {
        batch.set(stableUserRef, {
          ...legacyUser.data(),
          tossId,
          migratedFromUid: legacyUid,
          migratedAt: new Date().toISOString(),
        }, { merge: true });
        batch.set(legacyUserRef, {
          migratedToUid: stableUid,
          migratedAt: new Date().toISOString(),
        }, { merge: true });
      }
      for (const recordSnapshot of chunks[index]) {
        batch.set(
          doc(db, "users", stableUid, "records", recordSnapshot.id),
          recordSnapshot.data(),
          { merge: true },
        );
      }
      await batch.commit();
    }

    // 여러 기기의 레거시 기록이 합쳐져도 저장된 전체 기록을 기준으로 총액을 복구합니다.
    const mergedRecords = await withRequestTimeout(
      getDocs(collection(db, "users", stableUid, "records")),
      "기록 불러오기",
    );
    let totalPaid = 0;
    let totalReceived = 0;
    for (const recordSnapshot of mergedRecords.docs) {
      const record = recordSnapshot.data() as MoneyRecord;
      if ((record.mode || "paid") === "paid") totalPaid += record.amount;
      else totalReceived += record.amount;
    }
    await setDoc(stableUserRef, {
      totalAmount: totalPaid + totalReceived,
      totalPaid,
      totalReceived,
    }, { merge: true });
  },

  async getOrCreateUser(uid: string, tossId: string) {
    try {
      checkOnline();
      const userDocRef = doc(db, "users", uid);
      const userDoc = await withRequestTimeout(getDoc(userDocRef), "사용자 기록 확인");

      if (!userDoc.exists()) {
        const initialData = {
          tossId,
          createdAt: new Date().toISOString(),
          totalAmount: 0,
          totalPaid: 0,
          totalReceived: 0,
        };
        await setDoc(userDocRef, initialData);
        return initialData;
      }

      const data = userDoc.data();
      // 기존 유저: totalPaid/totalReceived가 없으면 마이그레이션
      if (data.totalPaid === undefined) {
        data.totalPaid = data.totalAmount || 0;
        data.totalReceived = 0;
      }
      return data;
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  /**
   * 레거시 데이터 마이그레이션 - 기존 friend 데이터에 mode: "paid" 추가
   */
  async migrateLegacyData(uid: string, friendsArray: MoneyRecord[]) {
    try {
      checkOnline();
      const batch = writeBatch(db);
      const recordsColRef = collection(db, "users", uid, "records");
      const userDocRef = doc(db, "users", uid);

      friendsArray.forEach((f) => {
        const fRef = doc(recordsColRef, f.id);
        batch.set(fRef, {
          ...f,
          mode: f.mode || "paid", // 기존 데이터는 paid로 기본값
          createdAt: new Date().toISOString(),
        });
      });

      const totalAmount = friendsArray.reduce((acc, f) => acc + f.amount, 0);

      batch.update(userDocRef, {
        friends: null,
        totalAmount,
        totalPaid: totalAmount,
        totalReceived: 0,
        migratedAt: new Date().toISOString(),
      });

      await batch.commit();
      return { totalAmount };
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  async fetchRecordsPage(uid: string) {
    try {
      checkOnline();
      const recordsColRef = collection(db, "users", uid, "records");
      // 개인 경조사 기록은 전체를 읽어야 필터, 최근 금액, 즐겨찾기 정렬이 정확합니다.
      const snapshot = await withRequestTimeout(getDocs(recordsColRef), "기록 불러오기");

      const fetchedRecords = snapshot.docs.map((d) => {
        const data = d.data() as MoneyRecord;
        return { ...data, mode: data.mode || "paid" }; // 기존 데이터 호환
      });
      return { fetchedRecords, lastVisible: null };
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  async fetchMoreRecords(uid: string, lastVisible: DocumentSnapshot) {
    try {
      checkOnline();
      void uid;
      void lastVisible;
      return { newRecords: [] as MoneyRecord[], newLastVisible: null };
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  async addRecord(
    uid: string,
    record: MoneyRecord,
  ): Promise<RecordTotals> {
    try {
      checkOnline();
      const recordRef = doc(db, "users", uid, "records", record.id);
      const userDocRef = doc(db, "users", uid);

      return await runTransaction(db, async (transaction) => {
        const userSnapshot = await transaction.get(userDocRef);
        const data = userSnapshot.data();
        const totals = applyRecordDelta(
          {
            totalPaid: data?.totalPaid ?? data?.totalAmount ?? 0,
            totalReceived: data?.totalReceived ?? 0,
          },
          null,
          record,
        );
        transaction.set(recordRef, record);
        transaction.set(userDocRef, {
          totalAmount: totals.totalPaid + totals.totalReceived,
          ...totals,
        }, { merge: true });
        return totals;
      });
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  async removeRecord(
    uid: string,
    recordId: string,
  ): Promise<RecordTotals> {
    try {
      checkOnline();
      const recordRef = doc(db, "users", uid, "records", recordId);
      const userDocRef = doc(db, "users", uid);

      return await runTransaction(db, async (transaction) => {
        const [userSnapshot, recordSnapshot] = await Promise.all([
          transaction.get(userDocRef),
          transaction.get(recordRef),
        ]);
        if (!recordSnapshot.exists()) throw new Error("삭제할 기록을 찾을 수 없습니다.");
        const data = userSnapshot.data();
        const totals = applyRecordDelta(
          {
            totalPaid: data?.totalPaid ?? data?.totalAmount ?? 0,
            totalReceived: data?.totalReceived ?? 0,
          },
          recordSnapshot.data() as MoneyRecord,
          null,
        );
        transaction.delete(recordRef);
        transaction.set(userDocRef, {
          totalAmount: totals.totalPaid + totals.totalReceived,
          ...totals,
        }, { merge: true });
        return totals;
      });
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  async updateRecord(
    uid: string,
    recordId: string,
    updates: Partial<MoneyRecord>,
  ): Promise<RecordTotals> {
    try {
      checkOnline();
      const recordRef = doc(db, "users", uid, "records", recordId);
      const userDocRef = doc(db, "users", uid);

      return await runTransaction(db, async (transaction) => {
        const [userSnapshot, recordSnapshot] = await Promise.all([
          transaction.get(userDocRef),
          transaction.get(recordRef),
        ]);
        if (!recordSnapshot.exists()) throw new Error("수정할 기록을 찾을 수 없습니다.");
        const previous = recordSnapshot.data() as MoneyRecord;
        const next = { ...previous, ...updates };
        const data = userSnapshot.data();
        const totals = applyRecordDelta(
          {
            totalPaid: data?.totalPaid ?? data?.totalAmount ?? 0,
            totalReceived: data?.totalReceived ?? 0,
          },
          previous,
          next,
        );
        transaction.update(recordRef, updates);
        transaction.set(userDocRef, {
          totalAmount: totals.totalPaid + totals.totalReceived,
          ...totals,
        }, { merge: true });
        return totals;
      });
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },
};
