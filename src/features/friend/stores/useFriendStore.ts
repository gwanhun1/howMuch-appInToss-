import { create } from "zustand";
import { persist } from "zustand/middleware";
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

interface FriendStore {
  friends: Friend[];
  selectedFriendId: string | null;
  editingFriend: Friend | null;
  currentPage: "main" | "amountInput";
  isFriendFormOpen: boolean;
  isProfileImageSheetOpen: boolean;
  lastAdMilestoneShown: number;
  userIdentifier: string | null;
  filterType: "전체" | "축의금" | "조의금" | "돌잔치";
  isCelebrating: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  totalAmount: number;
  error: string | null;
  lastVisible: DocumentSnapshot | null;

  // Actions
  setUserIdentifier: (id: string) => void;
  setFilterType: (type: "전체" | "축의금" | "조의금" | "돌잔치") => void;
  setCelebrating: (isCelebrating: boolean) => void;
  initializeStore: () => Promise<void>;
  fetchMoreFriends: () => Promise<void>;
  addFriend: (friend: Friend) => Promise<void>;
  removeFriend: (id: string) => Promise<void>;
  updateFriend: (id: string, updates: Partial<Friend>) => Promise<void>;
  setEditingFriend: (friend: Friend | null) => void;
  setSelectedFriendId: (id: string | null) => void;
  startAddingFriend: () => void;
  openFriendForm: (id: string) => void;
  closeFriendForm: () => void;
  openProfileImageSheet: () => void;
  closeProfileImageSheet: () => void;
  openAmountInput: () => void;
  closeAmountInput: () => void;
  resetToMain: () => void;
}

const PAGE_SIZE = 20;

export const useFriendStore = create<FriendStore>()(
  persist(
    (set, get) => ({
      friends: [],
      selectedFriendId: null,
      editingFriend: null,
      currentPage: "main",
      isFriendFormOpen: false,
      isProfileImageSheetOpen: false,
      lastAdMilestoneShown: 0,
      userIdentifier: null,
      filterType: "전체",
      isCelebrating: false,
      isLoading: true,
      isLoadingMore: false,
      hasMore: true,
      totalAmount: 0,
      error: null,
      lastVisible: null,

      setUserIdentifier: (id) => set({ userIdentifier: id }),
      setFilterType: (type) => set({ filterType: type }),
      setCelebrating: (isCelebrating) => set({ isCelebrating }),

      initializeStore: async () => {
        set({ isLoading: true, error: null });
        try {
          const userCredential = await signInAnonymously(auth);
          const uid = userCredential.user.uid;
          const tossId = await getTossUserIdentifier();
          set({ userIdentifier: uid });

          const userDocRef = doc(db, "users", uid);
          const userDoc = await getDoc(userDocRef);

          // 1. 기존 데이터 마이그레이션 (필요시)
          if (userDoc.exists() && userDoc.data().friends) {
            const legacyData = userDoc.data();
            const friendsArray = legacyData.friends as Friend[];

            // 하위 컬렉션으로 마이그레이션
            const batch = writeBatch(db);
            const recordsColRef = collection(db, "users", uid, "records");

            friendsArray.forEach((f) => {
              const fRef = doc(recordsColRef, f.id);
              batch.set(fRef, { ...f, createdAt: new Date().toISOString() });
            });

            // 마이그레이션된 문서 업데이트 (기존 friends 배열 제거)
            batch.update(userDocRef, {
              friends: null, // 제거
              totalAmount: friendsArray.reduce((acc, f) => acc + f.amount, 0),
              lastAdMilestoneShown: legacyData.lastAdMilestoneShown || 0,
              migratedAt: new Date().toISOString(),
            });

            await batch.commit();
            console.log("마이그레이션 완료");
          }

          // 2. 메타 데이터 로드
          const updatedUserDoc = await getDoc(userDocRef);
          if (updatedUserDoc.exists()) {
            const data = updatedUserDoc.data();
            set({
              totalAmount: data.totalAmount || 0,
              lastAdMilestoneShown: data.lastAdMilestoneShown || 0,
            });
          } else {
            await setDoc(userDocRef, {
              tossId,
              createdAt: new Date().toISOString(),
              totalAmount: 0,
            });
          }

          // 3. 첫 페이지 로드
          const recordsColRef = collection(db, "users", uid, "records");
          const q = query(
            recordsColRef,
            orderBy("name", "asc"),
            limit(PAGE_SIZE),
          );

          const snapshot = await getDocs(q);
          const fetchedFriends = snapshot.docs.map(
            (doc) => doc.data() as Friend,
          );
          const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

          set({
            friends: fetchedFriends,
            lastVisible,
            hasMore: fetchedFriends.length === PAGE_SIZE,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
          console.error("초기화 실패:", error);
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMoreFriends: async () => {
        const { userIdentifier, lastVisible, friends, hasMore, isLoadingMore } =
          get();
        if (!userIdentifier || !lastVisible || !hasMore || isLoadingMore)
          return;

        set({ isLoadingMore: true });
        try {
          const recordsColRef = collection(
            db,
            "users",
            userIdentifier,
            "records",
          );
          const q = query(
            recordsColRef,
            orderBy("name", "asc"),
            startAfter(lastVisible),
            limit(PAGE_SIZE),
          );

          const snapshot = await getDocs(q);
          const newFriends = snapshot.docs.map((doc) => doc.data() as Friend);
          const newLastVisible =
            snapshot.docs[snapshot.docs.length - 1] || null;

          set({
            friends: [...friends, ...newFriends],
            lastVisible: newLastVisible,
            hasMore: newFriends.length === PAGE_SIZE,
          });
        } catch (error) {
          console.error("추가 로드 실패:", error);
        } finally {
          set({ isLoadingMore: false });
        }
      },

      addFriend: async (friend) => {
        const { userIdentifier, friends, totalAmount, lastAdMilestoneShown } =
          get();
        if (!userIdentifier) {
          throw new Error("사용자 인증이 필요합니다.");
        }

        const newFriend = { ...friend, createdAt: new Date().toISOString() };
        const newTotalAmount = totalAmount + newFriend.amount;
        const newCount = friends.length + 1;
        const isMilestone = newCount > 0 && newCount % 5 === 0;
        const nextMilestone = isMilestone ? newCount : lastAdMilestoneShown;

        // 낙관적 업데이트: 먼저 UI 업데이트
        const optimisticFriends = [newFriend, ...friends].sort((a, b) => {
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return a.name.localeCompare(b.name);
        });

        set({
          friends: optimisticFriends,
          totalAmount: newTotalAmount,
          lastAdMilestoneShown: nextMilestone,
        });

        // Firebase에 저장 시도
        try {
          const recordRef = doc(
            db,
            "users",
            userIdentifier,
            "records",
            newFriend.id,
          );
          const userDocRef = doc(db, "users", userIdentifier);

          if (isMilestone && nextMilestone > lastAdMilestoneShown) {
            alert(`광고(테스트): 친구 ${nextMilestone}명 달성!`);
          }

          const batch = writeBatch(db);
          batch.set(recordRef, newFriend);
          batch.update(userDocRef, {
            totalAmount: newTotalAmount,
            lastAdMilestoneShown: nextMilestone,
          });
          await batch.commit();
        } catch (error) {
          // 실패 시 롤백
          set({
            friends,
            totalAmount,
            lastAdMilestoneShown,
          });
          console.error("추가 실패:", error);
          throw new Error("기록 저장에 실패했습니다. 다시 시도해주세요.");
        }
      },

      removeFriend: async (id) => {
        const { userIdentifier, friends, totalAmount } = get();
        if (!userIdentifier) {
          throw new Error("사용자 인증이 필요합니다.");
        }

        const friendToRemove = friends.find((f) => f.id === id);
        if (!friendToRemove) return;

        const newTotalAmount = Math.max(0, totalAmount - friendToRemove.amount);

        // 낙관적 업데이트: 먼저 UI에서 제거
        set({
          friends: friends.filter((f) => f.id !== id),
          totalAmount: newTotalAmount,
        });

        // Firebase에서 삭제 시도
        try {
          const recordRef = doc(db, "users", userIdentifier, "records", id);
          const userDocRef = doc(db, "users", userIdentifier);

          const batch = writeBatch(db);
          batch.delete(recordRef);
          batch.update(userDocRef, { totalAmount: newTotalAmount });
          await batch.commit();
        } catch (error) {
          // 실패 시 롤백
          set({
            friends,
            totalAmount,
          });
          console.error("삭제 실패:", error);
          throw new Error("기록 삭제에 실패했습니다. 다시 시도해주세요.");
        }
      },

      updateFriend: async (id, updates) => {
        const { userIdentifier, friends, totalAmount } = get();
        if (!userIdentifier) {
          throw new Error("사용자 인증이 필요합니다.");
        }

        const oldFriend = friends.find((f) => f.id === id);
        if (!oldFriend) return;

        let newTotalAmount = totalAmount;
        if (updates.amount !== undefined) {
          newTotalAmount = totalAmount - oldFriend.amount + updates.amount;
        }

        // 낙관적 업데이트: 먼저 UI 업데이트
        const optimisticFriends = friends
          .map((f) => (f.id === id ? { ...f, ...updates } : f))
          .sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return a.name.localeCompare(b.name);
          });

        set({
          friends: optimisticFriends,
          totalAmount: newTotalAmount,
        });

        // Firebase에 저장 시도
        try {
          const recordRef = doc(db, "users", userIdentifier, "records", id);
          const userDocRef = doc(db, "users", userIdentifier);

          const batch = writeBatch(db);
          batch.update(recordRef, updates);
          batch.update(userDocRef, { totalAmount: newTotalAmount });
          await batch.commit();
        } catch (error) {
          // 실패 시 롤백
          set({
            friends,
            totalAmount,
          });
          console.error("수정 실패:", error);
          throw new Error("기록 수정에 실패했습니다. 다시 시도해주세요.");
        }
      },

      setEditingFriend: (friend) => set({ editingFriend: friend }),
      setSelectedFriendId: (id) => set({ selectedFriendId: id }),

      startAddingFriend: () =>
        set({
          selectedFriendId: "new",
          editingFriend: {
            id: Date.now().toString(),
            name: "",
            profileIcon: "icon-face-cap",
            type: null,
            amount: 0,
            relation: "",
            date: "",
            isFavorite: false,
          },
          isFriendFormOpen: true,
          currentPage: "main",
        }),

      openFriendForm: (id) =>
        set((state) => {
          const friend = state.friends.find((f) => f.id === id) || null;
          return {
            selectedFriendId: id,
            editingFriend: friend ? { ...friend } : null,
            isFriendFormOpen: true,
            currentPage: "main",
          };
        }),

      closeFriendForm: () =>
        set({
          isFriendFormOpen: false,
          editingFriend: null,
          selectedFriendId: null,
        }),

      openProfileImageSheet: () => set({ isProfileImageSheetOpen: true }),
      closeProfileImageSheet: () => set({ isProfileImageSheetOpen: false }),
      openAmountInput: () =>
        set({ currentPage: "amountInput", isFriendFormOpen: false }),
      closeAmountInput: () =>
        set({ currentPage: "main", isFriendFormOpen: true }),
      resetToMain: () =>
        set({
          currentPage: "main",
          selectedFriendId: null,
          editingFriend: null,
          isFriendFormOpen: false,
          isProfileImageSheetOpen: false,
        }),
    }),
    {
      name: "howmuch-friends-storage-v3", // 구조 변경으로 인한 버전업
      version: 3,
      partialize: (state) => ({
        // 로컬에는 최소한의 상태만 유지 (동기화가 기본이므로)
        lastAdMilestoneShown: state.lastAdMilestoneShown,
      }),
    },
  ),
);
