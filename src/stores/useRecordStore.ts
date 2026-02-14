import { create, type StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import type { DocumentSnapshot } from "firebase/firestore";
import type { MoneyRecord, RecordMode, RecordType } from "../types/record";
import { recordService, type UserMetadata } from "../apis/recordService";
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
 * 1. 레코드 데이터 슬라이스
 */
interface RecordSlice {
  records: MoneyRecord[];
  totalPaid: number;
  totalReceived: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  lastVisible: DocumentSnapshot | null;
  userIdentifier: string | null;
  error: string | null;

  initializeStore: () => Promise<void>;
  fetchMoreRecords: () => Promise<void>;
  addRecord: (record: MoneyRecord) => Promise<void>;
  updateRecord: (id: string, updates: Partial<MoneyRecord>) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
  setUserIdentifier: (id: string) => void;
}

const createRecordSlice: StateCreator<
  RecordSlice & UISlice & AdSlice,
  [["zustand/persist", unknown]],
  [],
  RecordSlice
> = (set, get) => ({
  records: [],
  totalPaid: 0,
  totalReceived: 0,
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
      const { uid, tossId } = await recordService.authenticate();
      set({ userIdentifier: uid });

      const userData = (await recordService.getOrCreateUser(uid, tossId)) as UserMetadata;

      if (userData?.friends) {
        const { totalAmount } = await recordService.migrateLegacyData(
          uid,
          userData.friends,
          userData.lastAdMilestoneShown || 0,
        );
        set({ totalPaid: totalAmount, totalReceived: 0 });
      } else if (userData) {
        set({
          totalPaid: userData.totalPaid || userData.totalAmount || 0,
          totalReceived: userData.totalReceived || 0,
          lastAdMilestoneShown: userData.lastAdMilestoneShown || 0,
        });
      }

      const { fetchedRecords, lastVisible } = await recordService.fetchRecordsPage(uid);
      set({
        records: fetchedRecords,
        lastVisible,
        hasMore: fetchedRecords.length === 20,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "초기화 실패",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMoreRecords: async () => {
    const { userIdentifier, lastVisible, records, hasMore, isLoadingMore } = get();
    if (!userIdentifier || !lastVisible || !hasMore || isLoadingMore) return;

    set({ isLoadingMore: true });
    try {
      const { newRecords, newLastVisible } =
        await recordService.fetchMoreRecords(userIdentifier, lastVisible);
      set({
        records: [...records, ...newRecords],
        lastVisible: newLastVisible,
        hasMore: newRecords.length === 20,
      });
    } catch (error) {
      console.error("추가 로드 실패:", error);
    } finally {
      set({ isLoadingMore: false });
    }
  },

  addRecord: async (record) => {
    const { userIdentifier, records, totalPaid, totalReceived, lastAdMilestoneShown } = get();
    if (!userIdentifier) throw new Error("인증 필요");

    const newRecord = { ...record, createdAt: new Date().toISOString() };
    const newCount = records.length + 1;

    // 광고 마일스톤 체크
    if (adService.checkIsMilestone(newCount, lastAdMilestoneShown)) {
      set({ isLoading: true });
      await adService.loadAndShowAd({
        onDismissed: () => {
          set({ lastAdMilestoneShown: newCount, isAdLoaded: false });
        },
        onError: (error) => {
          console.error("[Store] 광고 에러:", error);
        },
      });
      set({ isLoading: false });
    }

    // 모드별 총액 업데이트
    const newTotalPaid = record.mode === "paid" ? totalPaid + record.amount : totalPaid;
    const newTotalReceived = record.mode === "received" ? totalReceived + record.amount : totalReceived;

    const sorted = [newRecord, ...records].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.name.localeCompare(b.name);
    });

    set({ records: sorted, totalPaid: newTotalPaid, totalReceived: newTotalReceived });

    try {
      await recordService.addRecord(
        userIdentifier,
        newRecord,
        newTotalPaid,
        newTotalReceived,
        get().lastAdMilestoneShown,
      );
      get().loadAd();
    } catch (error) {
      set({ records, totalPaid, totalReceived });
      throw error;
    }
  },

  updateRecord: async (id, updates) => {
    const { userIdentifier, records, totalPaid, totalReceived } = get();
    if (!userIdentifier) throw new Error("인증 필요");

    const old = records.find((r) => r.id === id);
    if (!old) throw new Error("수정할 기록을 찾을 수 없습니다.");

    let nextPaid = totalPaid;
    let nextReceived = totalReceived;
    if (updates.amount !== undefined) {
      if (old.mode === "paid") {
        nextPaid = totalPaid - old.amount + updates.amount;
      } else {
        nextReceived = totalReceived - old.amount + updates.amount;
      }
    }

    const updated = records
      .map((r) => (r.id === id ? { ...r, ...updates } : r))
      .sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.name.localeCompare(b.name);
      });

    set({ records: updated, totalPaid: nextPaid, totalReceived: nextReceived });

    try {
      await recordService.updateRecord(userIdentifier, id, updates, nextPaid, nextReceived);
    } catch (error) {
      set({ records, totalPaid, totalReceived });
      throw error;
    }
  },

  removeRecord: async (id) => {
    const { userIdentifier, records, totalPaid, totalReceived } = get();
    if (!userIdentifier) throw new Error("인증 필요");

    const target = records.find((r) => r.id === id);
    if (!target) throw new Error("삭제할 기록을 찾을 수 없습니다.");

    const nextPaid = target.mode === "paid" ? Math.max(0, totalPaid - target.amount) : totalPaid;
    const nextReceived = target.mode === "received" ? Math.max(0, totalReceived - target.amount) : totalReceived;

    set({
      records: records.filter((r) => r.id !== id),
      totalPaid: nextPaid,
      totalReceived: nextReceived,
    });

    try {
      await recordService.removeRecord(userIdentifier, id, nextPaid, nextReceived);
    } catch (error) {
      set({ records, totalPaid, totalReceived });
      throw error;
    }
  },
});

/**
 * 2. UI 상태 슬라이스
 */
interface UISlice {
  currentMode: RecordMode;
  selectedRecordId: string | null;
  editingRecord: MoneyRecord | null;
  currentPage: "main" | "amountInput";
  isRecordFormOpen: boolean;
  isProfileImageSheetOpen: boolean;
  filterType: "전체" | RecordType;
  isCelebrating: boolean;

  setCurrentMode: (mode: RecordMode) => void;
  setFilterType: (type: UISlice["filterType"]) => void;
  setCelebrating: (val: boolean) => void;
  setEditingRecord: (r: MoneyRecord | null) => void;
  setSelectedRecordId: (id: string | null) => void;
  startAddingRecord: (initialType?: RecordType | null) => void;
  openRecordForm: (id: string) => void;
  closeRecordForm: () => void;
  openProfileImageSheet: () => void;
  closeProfileImageSheet: () => void;
  openAmountInput: () => void;
  closeAmountInput: () => void;
  resetToMain: () => void;
}

const createUISlice: StateCreator<
  RecordSlice & UISlice & AdSlice,
  [["zustand/persist", unknown]],
  [],
  UISlice
> = (set) => ({
  currentMode: "paid",
  selectedRecordId: null,
  editingRecord: null,
  currentPage: "main",
  isRecordFormOpen: false,
  isProfileImageSheetOpen: false,
  filterType: "전체",
  isCelebrating: false,

  setCurrentMode: (currentMode) => set({ currentMode, filterType: "전체" }),
  setFilterType: (filterType) => set({ filterType }),
  setCelebrating: (isCelebrating) => set({ isCelebrating }),
  setEditingRecord: (editingRecord) => set({ editingRecord }),
  setSelectedRecordId: (selectedRecordId) => set({ selectedRecordId }),

  startAddingRecord: (initialType) =>
    set((state) => ({
      selectedRecordId: "new",
      editingRecord: {
        id: Date.now().toString(),
        mode: state.currentMode,
        name: "",
        profileIcon: "icon-face-cap",
        type: initialType || null,
        amount: 0,
        relation: "",
        date: "",
        isFavorite: false,
      },
      isRecordFormOpen: true,
      currentPage: "main",
    })),

  openRecordForm: (id) =>
    set((state) => ({
      selectedRecordId: id,
      editingRecord: state.records.find((r) => r.id === id) || null,
      isRecordFormOpen: true,
      currentPage: "main",
    })),

  closeRecordForm: () =>
    set({
      isRecordFormOpen: false,
      editingRecord: null,
      selectedRecordId: null,
    }),

  openProfileImageSheet: () => set({ isProfileImageSheetOpen: true }),
  closeProfileImageSheet: () => set({ isProfileImageSheetOpen: false }),
  openAmountInput: () =>
    set({ currentPage: "amountInput", isRecordFormOpen: false }),
  closeAmountInput: () => set({ currentPage: "main", isRecordFormOpen: true }),
  resetToMain: () =>
    set({
      currentPage: "main",
      selectedRecordId: null,
      editingRecord: null,
      isRecordFormOpen: false,
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
  RecordSlice & UISlice & AdSlice,
  [["zustand/persist", unknown]],
  [],
  AdSlice
> = (set, get) => ({
  lastAdMilestoneShown: 0,
  isAdLoaded: false,
  isAdLoading: false,
  loadAd: async () => {
    if (get().isAdLoading || adService.isAdLoaded()) return;

    set({ isAdLoading: true });
    adService.loadAd({
      onLoaded: () => set({ isAdLoaded: true, isAdLoading: false }),
      onError: () => set({ isAdLoaded: false, isAdLoading: false }),
    });
  },
});

/**
 * 최종 스토어 구성
 */
export const useRecordStore = create<RecordSlice & UISlice & AdSlice>()(
  persist(
    (...a) => ({
      ...createRecordSlice(...a),
      ...createUISlice(...a),
      ...createAdSlice(...a),
    }),
    {
      name: "howmuch-records-storage-v4",
      version: 4,
      partialize: (state) => ({
        lastAdMilestoneShown: state.lastAdMilestoneShown,
        currentMode: state.currentMode,
      }),
    },
  ),
);
