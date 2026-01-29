import { create } from "zustand";
import { persist } from "zustand/middleware";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { auth, db } from "@/utils/firebase";
import { getTossUserIdentifier } from "@/utils/toss";
import type { Friend } from "@/types/friend";

interface FriendStore {
  friends: Friend[];
  selectedFriendId: string | null;
  editingFriend: Friend | null;
  currentPage: "main" | "amountInput";
  isFriendFormOpen: boolean;
  isProfileImageSheetOpen: boolean;
  lastAdMilestoneShown: number;
  userIdentifier: string | null;

  // Actions
  setUserIdentifier: (id: string) => void;
  initializeStore: () => Promise<void>;
  addFriend: (friend: Friend) => void;
  removeFriend: (id: string) => void;
  updateFriend: (id: string, updates: Partial<Friend>) => void;
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

// Firestore에 데이터 저장하는 유틸리티
const syncToFirebase = async (
  uid: string,
  friends: Friend[],
  lastAdMilestone: number,
) => {
  try {
    const userDocRef = doc(db, "users", uid);
    await setDoc(
      userDocRef,
      {
        friends,
        lastAdMilestoneShown: lastAdMilestone,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("Firebase 동기화 실패:", error);
  }
};

export const useFriendStore = create<FriendStore>()(
  persist(
    (set) => ({
      friends: [],
      selectedFriendId: null,
      editingFriend: null,
      currentPage: "main",
      isFriendFormOpen: false,
      isProfileImageSheetOpen: false,
      lastAdMilestoneShown: 0,
      userIdentifier: null,

      setUserIdentifier: (id) => set({ userIdentifier: id }),

      initializeStore: async () => {
        try {
          // 1. Firebase 익명 로그인 (백그라운드)
          const userCredential = await signInAnonymously(auth);
          const uid = userCredential.user.uid;

          // 2. 토스 기기 식별자 가져오기 (메타데이터용)
          const tossId = await getTossUserIdentifier();

          set({ userIdentifier: uid });

          // 3. Firebase에서 데이터 불러오기
          const userDocRef = doc(db, "users", uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            set({
              friends: data.friends || [],
              lastAdMilestoneShown: data.lastAdMilestoneShown || 0,
            });
            console.log("Firebase에서 데이터를 불러왔습니다.");
          } else {
            // 처음 방문한 유저라면 문서 생성 (Toss ID 기록)
            await setDoc(userDocRef, {
              tossId,
              friends: [],
              lastAdMilestoneShown: 0,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("초기화 및 로그인 실패:", error);
        }
      },

      addFriend: (friend) => {
        set((state) => {
          const nextFriends = [...state.friends, friend];
          const nextCount = nextFriends.length;
          const isMilestone = nextCount > 0 && nextCount % 5 === 0;
          const nextMilestone = isMilestone
            ? nextCount
            : state.lastAdMilestoneShown;

          if (isMilestone && nextMilestone > state.lastAdMilestoneShown) {
            // 광고 로직 유지
            alert(`광고(테스트): 친구 ${nextMilestone}명 달성!`);
          }

          const newState = {
            friends: nextFriends,
            lastAdMilestoneShown: nextMilestone,
          };

          // Firebase 동기화
          if (state.userIdentifier) {
            syncToFirebase(state.userIdentifier, nextFriends, nextMilestone);
          }

          return newState;
        });
      },

      removeFriend: (id) =>
        set((state) => {
          const nextFriends = state.friends.filter((f) => f.id !== id);
          if (state.userIdentifier) {
            syncToFirebase(
              state.userIdentifier,
              nextFriends,
              state.lastAdMilestoneShown,
            );
          }
          return { friends: nextFriends };
        }),

      updateFriend: (id, updates) =>
        set((state) => {
          const nextFriends = state.friends.map((f) =>
            f.id === id ? { ...f, ...updates } : f,
          );
          if (state.userIdentifier) {
            syncToFirebase(
              state.userIdentifier,
              nextFriends,
              state.lastAdMilestoneShown,
            );
          }
          return { friends: nextFriends };
        }),

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
      name: "howmuch-friends-storage",
      version: 2,
      partialize: (state) => ({
        friends: state.friends,
        lastAdMilestoneShown: state.lastAdMilestoneShown,
      }),
    },
  ),
);
