import { create, type StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import type { DocumentSnapshot } from "firebase/firestore";
import type { Friend, FriendType } from "../types/friend";
import { friendService, type UserMetadata } from "../apis/friendService";
import { adService } from "../apis/adService";

/**
 * 토스 인앱 SDK 타입 정의
 */
declare global {
  interface Window {
    toss?: {
      loadAppsInTossAdMob: (params: {
        options: { adGroupId: string };
        onEvent?: (event: { type: string; data?: unknown }) => void;
        onError?: (error: unknown) => void;
      }) => () => void;
      showAppsInTossAdMob: (params: {
        options: { adGroupId: string };
        onEvent?: (event: { type: string; data?: unknown }) => void;
        onError?: (error: unknown) => void;
      }) => void;
    };
  }
}

/**
 * 1. 친구 데이터 슬라이스 (State & Actions)
 */
interface FriendSlice {
  friends: Friend[];
  totalAmount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  lastVisible: DocumentSnapshot | null;
  userIdentifier: string | null;
  error: string | null;

  initializeStore: () => Promise<void>;
  fetchMoreFriends: () => Promise<void>;
  addFriend: (friend: Friend) => Promise<void>;
  updateFriend: (id: string, updates: Partial<Friend>) => Promise<void>;
  removeFriend: (id: string) => Promise<void>;
  setUserIdentifier: (id: string) => void;
}

const createFriendSlice: StateCreator<
  FriendSlice & UISlice & AdSlice,
  [["zustand/persist", unknown]],
  [],
  FriendSlice
> = (set, get) => ({
  friends: [],
  totalAmount: 0,
  isLoading: true,
  isLoadingMore: false,
  hasMore: true,
  lastVisible: null,
  userIdentifier: null,
  error: null,

  setUserIdentifier: (id) => set({ userIdentifier: id }),

  initializeStore: async () => {
    set({ isLoading: true, error: null });
    try {
      const { uid, tossId } = await friendService.authenticate();
      set({ userIdentifier: uid });

      const userData = (await friendService.getOrCreateUser(
        uid,
        tossId,
      )) as UserMetadata;

      if (userData?.friends) {
        const { totalAmount } = await friendService.migrateLegacyData(
          uid,
          userData.friends,
          userData.lastAdMilestoneShown || 0,
        );
        set({ totalAmount });
      } else if (userData) {
        set({
          totalAmount: userData.totalAmount || 0,
          lastAdMilestoneShown: userData.lastAdMilestoneShown || 0,
        });
      }

      const { fetchedFriends, lastVisible } =
        await friendService.fetchFriendsPage(uid);
      set({
        friends: fetchedFriends,
        lastVisible,
        hasMore: fetchedFriends.length === 20,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "초기화 실패",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMoreFriends: async () => {
    const { userIdentifier, lastVisible, friends, hasMore, isLoadingMore } =
      get();
    if (!userIdentifier || !lastVisible || !hasMore || isLoadingMore) return;

    set({ isLoadingMore: true });
    try {
      const { newFriends, newLastVisible } =
        await friendService.fetchMoreFriends(userIdentifier, lastVisible);
      set({
        friends: [...friends, ...newFriends],
        lastVisible: newLastVisible,
        hasMore: newFriends.length === 20,
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
    if (!userIdentifier) throw new Error("인증 필요");

    const newFriend = { ...friend, createdAt: new Date().toISOString() };
    const newCount = friends.length + 1;

    // 1. 광고 마일스톤 체크 (공식 패턴: load → show → 다음 load)
    if (adService.checkIsMilestone(newCount, lastAdMilestoneShown)) {
      console.log("[Store] 광고 표시 조건 충족");
      set({ isLoading: true });

      // loadAndShowAd: 로드 → 표시 → 다음 광고 미리 로드까지 처리
      await adService.loadAndShowAd({
        onDismissed: () => {
          console.log("[Store] 광고 닫힘 - 마일스톤 업데이트");
          set({ lastAdMilestoneShown: newCount, isAdLoaded: false });
        },
        onError: (error) => {
          console.error("[Store] 광고 에러:", error);
        },
      });

      set({ isLoading: false });
    }

    // 2. 상태 업데이트
    const newTotalAmount = totalAmount + newFriend.amount;
    const sorted = [newFriend, ...friends].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.name.localeCompare(b.name);
    });

    set({ friends: sorted, totalAmount: newTotalAmount });

    try {
      await friendService.addFriend(
        userIdentifier,
        newFriend,
        newTotalAmount,
        get().lastAdMilestoneShown,
      );
      get().loadAd(); // 다음 광고 미리 로드
    } catch (error) {
      set({ friends, totalAmount });
      throw error;
    }
  },

  updateFriend: async (id, updates) => {
    const { userIdentifier, friends, totalAmount } = get();
    if (!userIdentifier) return;

    const old = friends.find((f) => f.id === id);
    if (!old) return;

    let nextTotal = totalAmount;
    if (updates.amount !== undefined) {
      nextTotal = totalAmount - old.amount + updates.amount;
    }

    const updated = friends
      .map((f) => (f.id === id ? { ...f, ...updates } : f))
      .sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.name.localeCompare(b.name);
      });

    set({ friends: updated, totalAmount: nextTotal });

    try {
      await friendService.updateFriend(userIdentifier, id, updates, nextTotal);
    } catch {
      set({ friends, totalAmount });
    }
  },

  removeFriend: async (id) => {
    const { userIdentifier, friends, totalAmount } = get();
    if (!userIdentifier) return;

    const target = friends.find((f) => f.id === id);
    if (!target) return;

    const nextTotal = Math.max(0, totalAmount - target.amount);
    set({
      friends: friends.filter((f) => f.id !== id),
      totalAmount: nextTotal,
    });

    try {
      await friendService.removeFriend(userIdentifier, id, nextTotal);
    } catch {
      set({ friends, totalAmount });
    }
  },
});

/**
 * 2. UI 상태 슬라이스
 */
interface UISlice {
  selectedFriendId: string | null;
  editingFriend: Friend | null;
  currentPage: "main" | "amountInput";
  isFriendFormOpen: boolean;
  isProfileImageSheetOpen: boolean;
  filterType: "전체" | "축의금" | "조의금" | "돌잔치";
  isCelebrating: boolean;

  setFilterType: (type: UISlice["filterType"]) => void;
  setCelebrating: (val: boolean) => void;
  setEditingFriend: (f: Friend | null) => void;
  setSelectedFriendId: (id: string | null) => void;
  startAddingFriend: (initialType?: FriendType | null) => void;
  openFriendForm: (id: string) => void;
  closeFriendForm: () => void;
  openProfileImageSheet: () => void;
  closeProfileImageSheet: () => void;
  openAmountInput: () => void;
  closeAmountInput: () => void;
  resetToMain: () => void;
}

const createUISlice: StateCreator<
  FriendSlice & UISlice & AdSlice,
  [["zustand/persist", unknown]],
  [],
  UISlice
> = (set) => ({
  selectedFriendId: null,
  editingFriend: null,
  currentPage: "main",
  isFriendFormOpen: false,
  isProfileImageSheetOpen: false,
  filterType: "전체",
  isCelebrating: false,

  setFilterType: (filterType) => set({ filterType }),
  setCelebrating: (isCelebrating) => set({ isCelebrating }),
  setEditingFriend: (editingFriend) => set({ editingFriend }),
  setSelectedFriendId: (selectedFriendId) => set({ selectedFriendId }),

  startAddingFriend: (initialType) =>
    set({
      selectedFriendId: "new",
      editingFriend: {
        id: Date.now().toString(),
        name: "",
        profileIcon: "icon-face-cap",
        type: initialType || null,
        amount: 0,
        relation: "",
        date: "",
        isFavorite: false,
      },
      isFriendFormOpen: true,
      currentPage: "main",
    }),

  openFriendForm: (id) =>
    set((state) => ({
      selectedFriendId: id,
      editingFriend: state.friends.find((f) => f.id === id) || null,
      isFriendFormOpen: true,
      currentPage: "main",
    })),

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
  closeAmountInput: () => set({ currentPage: "main", isFriendFormOpen: true }),
  resetToMain: () =>
    set({
      currentPage: "main",
      selectedFriendId: null,
      editingFriend: null,
      isFriendFormOpen: false,
      isProfileImageSheetOpen: false,
      isCelebrating: false,
    }),
});

/**
 * 3. 광고 상태 슬라이스
 */
interface AdSlice {
  lastAdMilestoneShown: number;
  isAdLoaded: boolean;
  isAdLoading: boolean;
  loadAd: () => Promise<void>;
}

const createAdSlice: StateCreator<
  FriendSlice & UISlice & AdSlice,
  [["zustand/persist", unknown]],
  [],
  AdSlice
> = (set, get) => ({
  lastAdMilestoneShown: 0,
  isAdLoaded: false,
  isAdLoading: false,
  loadAd: async () => {
    if (get().isAdLoading || adService.isAdLoaded()) {
      console.log("[Store] 광고 이미 로드 중이거나 로드됨 - 스킵");
      return;
    }

    console.log("[Store] 광고 미리 로드 시작");
    set({ isAdLoading: true });

    adService.loadAd({
      onLoaded: () => {
        console.log("[Store] 광고 미리 로드 성공");
        set({ isAdLoaded: true, isAdLoading: false });
      },
      onError: (error) => {
        console.error("[Store] 광고 미리 로드 실패", error);
        set({ isAdLoaded: false, isAdLoading: false });
      },
    });
  },
});

/**
 * 최종 스토어 구성
 */
export const useFriendStore = create<FriendSlice & UISlice & AdSlice>()(
  persist(
    (...a) => ({
      ...createFriendSlice(...a),
      ...createUISlice(...a),
      ...createAdSlice(...a),
    }),
    {
      name: "howmuch-friends-storage-v3",
      version: 3,
      partialize: (state) => ({
        lastAdMilestoneShown: state.lastAdMilestoneShown,
      }),
    },
  ),
);
