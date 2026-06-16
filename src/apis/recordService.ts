import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  DocumentSnapshot,
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { auth, db } from "@/utils/firebase";
import { getTossUserIdentifier } from "@/utils/toss";
import type { MoneyRecord } from "../types/record";

const PAGE_SIZE = 20;
const REQUEST_TIMEOUT = 15000;

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

function withTimeout<T>(
  promise: Promise<T>,
  ms: number = REQUEST_TIMEOUT,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "요청 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.",
            ),
          ),
        ms,
      ),
    ),
  ]);
}

function checkOnline(): void {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new Error("인터넷 연결이 없습니다. 네트워크 상태를 확인해주세요.");
  }
}

function throwUserFriendlyError(error: unknown): never {
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
      const userCredential = await withTimeout(signInAnonymously(auth));
      const uid = userCredential.user.uid;
      const tossId = await getTossUserIdentifier();
      return { uid, tossId };
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  async getOrCreateUser(uid: string, tossId: string) {
    try {
      checkOnline();
      const userDocRef = doc(db, "users", uid);
      const userDoc = await withTimeout(getDoc(userDocRef));

      if (!userDoc.exists()) {
        const initialData = {
          tossId,
          createdAt: new Date().toISOString(),
          totalAmount: 0,
          totalPaid: 0,
          totalReceived: 0,
        };
        await withTimeout(setDoc(userDocRef, initialData));
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

      await withTimeout(batch.commit());
      return { totalAmount };
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  async fetchRecordsPage(uid: string) {
    try {
      checkOnline();
      const recordsColRef = collection(db, "users", uid, "records");
      const q = query(recordsColRef, orderBy("name", "asc"), limit(PAGE_SIZE));
      const snapshot = await withTimeout(getDocs(q));

      const fetchedRecords = snapshot.docs.map((d) => {
        const data = d.data() as MoneyRecord;
        return { ...data, mode: data.mode || "paid" }; // 기존 데이터 호환
      });
      const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

      return { fetchedRecords, lastVisible };
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  async fetchMoreRecords(uid: string, lastVisible: DocumentSnapshot) {
    try {
      checkOnline();
      const recordsColRef = collection(db, "users", uid, "records");
      const q = query(
        recordsColRef,
        orderBy("name", "asc"),
        startAfter(lastVisible),
        limit(PAGE_SIZE),
      );

      const snapshot = await withTimeout(getDocs(q));
      const newRecords = snapshot.docs.map((d) => {
        const data = d.data() as MoneyRecord;
        return { ...data, mode: data.mode || "paid" };
      });
      const newLastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

      return { newRecords, newLastVisible };
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  async addRecord(
    uid: string,
    record: MoneyRecord,
    totalPaid: number,
    totalReceived: number,
  ) {
    try {
      checkOnline();
      const recordRef = doc(db, "users", uid, "records", record.id);
      const userDocRef = doc(db, "users", uid);

      const batch = writeBatch(db);
      batch.set(recordRef, record);
      batch.update(userDocRef, {
        totalAmount: totalPaid + totalReceived,
        totalPaid,
        totalReceived,
      });

      await withTimeout(batch.commit());
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  async removeRecord(
    uid: string,
    recordId: string,
    totalPaid: number,
    totalReceived: number,
  ) {
    try {
      checkOnline();
      const recordRef = doc(db, "users", uid, "records", recordId);
      const userDocRef = doc(db, "users", uid);

      const batch = writeBatch(db);
      batch.delete(recordRef);
      batch.update(userDocRef, {
        totalAmount: totalPaid + totalReceived,
        totalPaid,
        totalReceived,
      });

      await withTimeout(batch.commit());
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  async updateRecord(
    uid: string,
    recordId: string,
    updates: Partial<MoneyRecord>,
    totalPaid: number,
    totalReceived: number,
  ) {
    try {
      checkOnline();
      const recordRef = doc(db, "users", uid, "records", recordId);
      const userDocRef = doc(db, "users", uid);

      const batch = writeBatch(db);
      batch.update(recordRef, updates);
      batch.update(userDocRef, {
        totalAmount: totalPaid + totalReceived,
        totalPaid,
        totalReceived,
      });

      await withTimeout(batch.commit());
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },
};
