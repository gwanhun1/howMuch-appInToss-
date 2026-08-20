import { create, type StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import type { DocumentSnapshot } from "firebase/firestore";
import type { MoneyRecord, RecordMode, RecordType } from "../types/record";
import { recordService, type UserMetadata } from "../apis/recordService";
import { applyRecordDelta } from "../utils/recordTotals";

/** 첫 기록 저장 후 mode-toggle을 강조하는 시간(ms) */
const MODE_TOGGLE_PULSE_DURATION_MS = 4000;

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
  RecordSlice & UISlice,
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
      const { uid, tossId: initialTossId } = await recordService.authenticate();
      set({ userIdentifier: uid });

      const userData = (await recordService.getOrCreateUser(
        uid,
        initialTossId,
      )) as UserMetadata;

      if (userData?.friends) {
        const { totalAmount } = await recordService.migrateLegacyData(
          uid,
          userData.friends,
        );
        set({ totalPaid: totalAmount, totalReceived: 0 });
      } else if (userData) {
        set({
          totalPaid: userData.totalPaid || userData.totalAmount || 0,
          totalReceived: userData.totalReceived || 0,
        });
      }

      const { fetchedRecords, lastVisible } =
        await recordService.fetchRecordsPage(uid);
      set({
        records: fetchedRecords,
        lastVisible,
        hasMore: false,
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
    const { userIdentifier, lastVisible, records, hasMore, isLoadingMore } =
      get();
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
    const snapshot = get();
    const { userIdentifier, records, totalPaid, totalReceived, modeTogglePulse } =
      snapshot;
    if (!userIdentifier) throw new Error("인증 필요");

    const isFirstRecord = records.length === 0;
    const newRecord = { ...record, createdAt: new Date().toISOString() };

    const newTotalPaid =
      record.mode === "paid" ? totalPaid + record.amount : totalPaid;
    const newTotalReceived =
      record.mode === "received"
        ? totalReceived + record.amount
        : totalReceived;

    // UI에서 isFavorite/date/createdAt 기준으로 재정렬하므로 스토어는 단순 prepend.
    set({
      records: [newRecord, ...records],
      totalPaid: newTotalPaid,
      totalReceived: newTotalReceived,
    });

    try {
      const persistedTotals = await recordService.addRecord(
        userIdentifier,
        newRecord,
      );
      set(persistedTotals);
    } catch (error) {
      set({
        records,
        totalPaid,
        totalReceived,
        modeTogglePulse,
      });
      throw error;
    }

    if (isFirstRecord) {
      set({ modeTogglePulse: true });
      setTimeout(
        () => set({ modeTogglePulse: false }),
        MODE_TOGGLE_PULSE_DURATION_MS,
      );
    }
  },

  updateRecord: async (id, updates) => {
    const { userIdentifier, records, totalPaid, totalReceived } = get();
    if (!userIdentifier) throw new Error("인증 필요");

    const old = records.find((r) => r.id === id);
    if (!old) throw new Error("수정할 기록을 찾을 수 없습니다.");

    const nextRecord = { ...old, ...updates };
    const optimisticTotals = applyRecordDelta(
      { totalPaid, totalReceived },
      old,
      nextRecord,
    );

    const updated = records
      .map((r) => (r.id === id ? { ...r, ...updates } : r))
      .sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.name.localeCompare(b.name);
      });

    set({ records: updated, ...optimisticTotals });

    try {
      const persistedTotals = await recordService.updateRecord(
        userIdentifier,
        id,
        updates,
      );
      set(persistedTotals);
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

    const optimisticTotals = applyRecordDelta(
      { totalPaid, totalReceived },
      target,
      null,
    );

    set({
      records: records.filter((r) => r.id !== id),
      ...optimisticTotals,
    });

    try {
      const persistedTotals = await recordService.removeRecord(
        userIdentifier,
        id,
      );
      set(persistedTotals);
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
  modeTogglePulse: boolean;
  viewMode: "card" | "list";

  setCurrentMode: (mode: RecordMode) => void;
  setViewMode: (mode: UISlice["viewMode"]) => void;
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
  RecordSlice & UISlice,
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
  modeTogglePulse: false,
  viewMode: "card",

  setCurrentMode: (currentMode) => set({ currentMode, filterType: "전체" }),
  setViewMode: (viewMode) => set({ viewMode }),
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
 * 최종 스토어 구성
 */
export const useRecordStore = create<RecordSlice & UISlice>()(
  persist(
    (...a) => ({
      ...createRecordSlice(...a),
      ...createUISlice(...a),
    }),
    {
      name: "howmuch-records-storage-v4",
      version: 4,
      partialize: (state) => ({
        currentMode: state.currentMode,
        viewMode: state.viewMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.modeTogglePulse = false;
        }
      },
    },
  ),
);
