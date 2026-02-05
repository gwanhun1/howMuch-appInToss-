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
import type { Friend } from "../types/friend";

const PAGE_SIZE = 20;
const REQUEST_TIMEOUT = 15000; // 15초 타임아웃

/**
 * Firebase 에러 코드를 사용자 친화적 메시지로 변환
 */
const ERROR_MESSAGES: Record<string, string> = {
  // 네트워크/연결 관련
  "unavailable": "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
  "network-request-failed": "네트워크 연결에 실패했습니다.",
  
  // 권한 관련
  "permission-denied": "접근 권한이 없습니다.",
  "unauthenticated": "로그인이 필요합니다.",
  
  // 데이터 관련
  "not-found": "데이터를 찾을 수 없습니다.",
  "already-exists": "이미 존재하는 데이터입니다.",
  "resource-exhausted": "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
  
  // 기타
  "cancelled": "요청이 취소되었습니다.",
  "internal": "서버 오류가 발생했습니다.",
  "invalid-argument": "잘못된 요청입니다.",
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // 이미 한글 메시지인 경우 그대로 반환
    if (error.message.includes("인터넷") || error.message.includes("시간이 초과")) {
      return error.message;
    }
    
    // Firebase 에러 코드 추출 (FirebaseError의 code 속성)
    const firebaseError = error as { code?: string };
    if (firebaseError.code) {
      const code = firebaseError.code.replace("auth/", "").replace("firestore/", "");
      return ERROR_MESSAGES[code] || "오류가 발생했습니다. 다시 시도해주세요.";
    }
    
    return error.message;
  }
  return "알 수 없는 오류가 발생했습니다.";
}

/**
 * 타임아웃이 적용된 Promise 래퍼
 */
function withTimeout<T>(promise: Promise<T>, ms: number = REQUEST_TIMEOUT): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("요청 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.")), ms)
    ),
  ]);
}

/**
 * 오프라인 상태 확인
 */
function checkOnline(): void {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new Error("인터넷 연결이 없습니다. 네트워크 상태를 확인해주세요.");
  }
}

/**
 * 에러를 사용자 친화적 메시지로 래핑하여 throw
 */
function throwUserFriendlyError(error: unknown): never {
  throw new Error(getErrorMessage(error));
}

export interface UserMetadata {
  tossId: string;
  createdAt: string;
  totalAmount: number;
  lastAdMilestoneShown: number;
  friends?: Friend[]; // 마이그레이션용 레거시 필드
}

export const friendService = {
  /**
   * 익명 로그인 및 사용자 세션 초기화
   */
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

  /**
   * 사용자 문서 가져오기 또는 생성
   */
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
          lastAdMilestoneShown: 0,
        };
        await withTimeout(setDoc(userDocRef, initialData));
        return initialData;
      }

      return userDoc.data();
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  /**
   * 레거시 데이터 마이그레이션 (필요시)
   */
  async migrateLegacyData(
    uid: string,
    friendsArray: Friend[],
    lastAdMilestoneShown: number,
  ) {
    try {
      checkOnline();
      const batch = writeBatch(db);
      const recordsColRef = collection(db, "users", uid, "records");
      const userDocRef = doc(db, "users", uid);

      friendsArray.forEach((f) => {
        const fRef = doc(recordsColRef, f.id);
        batch.set(fRef, { ...f, createdAt: new Date().toISOString() });
      });

      const totalAmount = friendsArray.reduce((acc, f) => acc + f.amount, 0);

      batch.update(userDocRef, {
        friends: null,
        totalAmount,
        lastAdMilestoneShown,
        migratedAt: new Date().toISOString(),
      });

      await withTimeout(batch.commit());
      return { totalAmount };
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  /**
   * 친구 목록 첫 페이지 로드
   */
  async fetchFriendsPage(uid: string) {
    try {
      checkOnline();
      const recordsColRef = collection(db, "users", uid, "records");
      const q = query(recordsColRef, orderBy("name", "asc"), limit(PAGE_SIZE));
      const snapshot = await withTimeout(getDocs(q));

      const fetchedFriends = snapshot.docs.map((doc) => doc.data() as Friend);
      const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

      return { fetchedFriends, lastVisible };
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  /**
   * 친구 목록 다음 페이지 로드
   */
  async fetchMoreFriends(uid: string, lastVisible: DocumentSnapshot) {
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
      const newFriends = snapshot.docs.map((doc) => doc.data() as Friend);
      const newLastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

      return { newFriends, newLastVisible };
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  /**
   * 친구 추가 및 총 금액 업데이트
   */
  async addFriend(
    uid: string,
    friend: Friend,
    totalAmount: number,
    lastAdMilestoneShown: number,
  ) {
    try {
      checkOnline();
      const recordRef = doc(db, "users", uid, "records", friend.id);
      const userDocRef = doc(db, "users", uid);

      const batch = writeBatch(db);
      batch.set(recordRef, friend);
      batch.update(userDocRef, {
        totalAmount,
        lastAdMilestoneShown,
      });

      await withTimeout(batch.commit());
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  /**
   * 친구 삭제 및 총 금액 업데이트
   */
  async removeFriend(uid: string, friendId: string, totalAmount: number) {
    try {
      checkOnline();
      const recordRef = doc(db, "users", uid, "records", friendId);
      const userDocRef = doc(db, "users", uid);

      const batch = writeBatch(db);
      batch.delete(recordRef);
      batch.update(userDocRef, { totalAmount });

      await withTimeout(batch.commit());
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },

  /**
   * 친구 정보 수정 및 총 금액 업데이트
   */
  async updateFriend(
    uid: string,
    friendId: string,
    updates: Partial<Friend>,
    totalAmount: number,
  ) {
    try {
      checkOnline();
      const recordRef = doc(db, "users", uid, "records", friendId);
      const userDocRef = doc(db, "users", uid);

      const batch = writeBatch(db);
      batch.update(recordRef, updates);
      batch.update(userDocRef, { totalAmount });

      await withTimeout(batch.commit());
    } catch (error) {
      throwUserFriendlyError(error);
    }
  },
};
