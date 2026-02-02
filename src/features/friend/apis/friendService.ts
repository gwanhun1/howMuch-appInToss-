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
    const userCredential = await signInAnonymously(auth);
    const uid = userCredential.user.uid;
    const tossId = await getTossUserIdentifier();
    return { uid, tossId };
  },

  /**
   * 사용자 문서 가져오기 또는 생성
   */
  async getOrCreateUser(uid: string, tossId: string) {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const initialData = {
        tossId,
        createdAt: new Date().toISOString(),
        totalAmount: 0,
        lastAdMilestoneShown: 0,
      };
      await setDoc(userDocRef, initialData);
      return initialData;
    }

    return userDoc.data();
  },

  /**
   * 레거시 데이터 마이그레이션 (필요시)
   */
  async migrateLegacyData(
    uid: string,
    friendsArray: Friend[],
    lastAdMilestoneShown: number,
  ) {
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

    await batch.commit();
    return { totalAmount };
  },

  /**
   * 친구 목록 첫 페이지 로드
   */
  async fetchFriendsPage(uid: string) {
    const recordsColRef = collection(db, "users", uid, "records");
    const q = query(recordsColRef, orderBy("name", "asc"), limit(PAGE_SIZE));
    const snapshot = await getDocs(q);

    const fetchedFriends = snapshot.docs.map((doc) => doc.data() as Friend);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

    return { fetchedFriends, lastVisible };
  },

  /**
   * 친구 목록 다음 페이지 로드
   */
  async fetchMoreFriends(uid: string, lastVisible: DocumentSnapshot) {
    const recordsColRef = collection(db, "users", uid, "records");
    const q = query(
      recordsColRef,
      orderBy("name", "asc"),
      startAfter(lastVisible),
      limit(PAGE_SIZE),
    );

    const snapshot = await getDocs(q);
    const newFriends = snapshot.docs.map((doc) => doc.data() as Friend);
    const newLastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

    return { newFriends, newLastVisible };
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
    const recordRef = doc(db, "users", uid, "records", friend.id);
    const userDocRef = doc(db, "users", uid);

    const batch = writeBatch(db);
    batch.set(recordRef, friend);
    batch.update(userDocRef, {
      totalAmount,
      lastAdMilestoneShown,
    });

    await batch.commit();
  },

  /**
   * 친구 삭제 및 총 금액 업데이트
   */
  async removeFriend(uid: string, friendId: string, totalAmount: number) {
    const recordRef = doc(db, "users", uid, "records", friendId);
    const userDocRef = doc(db, "users", uid);

    const batch = writeBatch(db);
    batch.delete(recordRef);
    batch.update(userDocRef, { totalAmount });

    await batch.commit();
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
    const recordRef = doc(db, "users", uid, "records", friendId);
    const userDocRef = doc(db, "users", uid);

    const batch = writeBatch(db);
    batch.update(recordRef, updates);
    batch.update(userDocRef, { totalAmount });

    await batch.commit();
  },
};
