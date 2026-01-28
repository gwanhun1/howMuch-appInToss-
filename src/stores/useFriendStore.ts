import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Friend } from "@/types/friend";

interface FriendStore {
  friends: Friend[];
  selectedFriendId: string | null;
  editingFriend: Friend | null;
  currentPage: "main" | "amountInput";
  isFriendFormOpen: boolean;
  isProfileImageSheetOpen: boolean;
  lastAdMilestoneShown: number;
  addFriend: (friend: Friend) => void;
  removeFriend: (id: string) => void;
  updateFriend: (id: string, updates: Partial<Friend>) => void;
  setEditingFriend: (friend: Friend | null) => void; // used for draft persistence
  setSelectedFriendId: (id: string | null) => void;
  openFriendForm: (id: string) => void;
  closeFriendForm: () => void;
  openProfileImageSheet: () => void;
  closeProfileImageSheet: () => void;
  openAmountInput: () => void;
  closeAmountInput: () => void;
  resetToMain: () => void;
}

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
      addFriend: (friend) =>
        set((state) => {
          const nextFriends = [...state.friends, friend];
          const nextCount = nextFriends.length;

          const isMilestone = nextCount > 0 && nextCount % 5 === 0;
          const nextMilestone = isMilestone ? nextCount : null;

          if (
            nextMilestone != null &&
            nextMilestone > state.lastAdMilestoneShown
          ) {
            alert(`광고(테스트): 친구 ${nextMilestone}명 달성!`);
            return {
              friends: nextFriends,
              lastAdMilestoneShown: nextMilestone,
            };
          }

          return { friends: nextFriends };
        }),
      removeFriend: (id) =>
        set((state) => ({ friends: state.friends.filter((f) => f.id !== id) })),
      updateFriend: (id, updates) =>
        set((state) => ({
          friends: state.friends.map((f) =>
            f.id === id ? { ...f, ...updates } : f,
          ),
        })),
      setEditingFriend: (friend) => set({ editingFriend: friend }),
      setSelectedFriendId: (id) => set({ selectedFriendId: id }),
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
        set((state) => {
          // 이름이 없는 친구 데이터 클린업 (유령 데이터 방지)
          // 단, 금액 입력 화면으로 이동 중인 경우는 제외
          const selectedFriend = state.friends.find(
            (f) => f.id === state.selectedFriendId,
          );
          if (
            state.currentPage === "main" &&
            selectedFriend &&
            selectedFriend.name.trim() === ""
          ) {
            return {
              friends: state.friends.filter(
                (f) => f.id !== state.selectedFriendId,
              ),
              isFriendFormOpen: false,
              selectedFriendId: null,
              editingFriend: null,
            };
          }
          return { isFriendFormOpen: false, editingFriend: null };
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
        // editingFriend는 저장하지 않아도 됨 (앱 재시작시 유지 안해도 되면) unless needed
        // but for page reload safety let's include it if persistence across reload is expected.
        // The user issue is navigation, not reload. But "persist" middleware suggests they want it.
        // Let's safe-guard and only persist friends and ad milestone as before to be safe on storage size,
        // unless the user explicitly wants draft persistence across reload.
        // Given "AmountInputPage" navigation is client-side routing (or conditional rendering), global state in memory is enough.
      }),
    },
  ),
);
