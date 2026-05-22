import {
  tossAuthService,
  type TossUserMeResponse,
} from "../apis/tossAuthService";
import { create, type StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import type { DocumentSnapshot } from "firebase/firestore";
import type { MoneyRecord, RecordMode, RecordType } from "../types/record";
import { recordService, type UserMetadata } from "../apis/recordService";

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
  RecordSlice & UISlice & AdSlice & AuthSlice,
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

      // 토스 연결 여부 판별.
      // authenticate()는 익명 유저에게도 anon-UUID 또는 deviceId를 tossId 필드로 저장하므로,
      // "anon-" 접두사가 없는 값은 토스 연결로 간주한다.
      const rawTossId = userData?.tossId;
      const isVerifiedTossUser =
        typeof rawTossId === "string" &&
        rawTossId.length > 0 &&
        !rawTossId.startsWith("anon-");

      if (!isVerifiedTossUser) {
        set({ tossUser: null });
      } else if (!get().tossUser) {
        set({
          tossUser: {
            userKey: rawTossId,
            scope: "",
            agreedTerms: [],
          },
        });
      }

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

      const { fetchedRecords, lastVisible } =
        await recordService.fetchRecordsPage(uid);
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
    const {
      userIdentifier,
      records,
      totalPaid,
      totalReceived,
      lastAdMilestoneShown,
      modeTogglePulse,
    } = snapshot;
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
      await recordService.addRecord(
        userIdentifier,
        newRecord,
        newTotalPaid,
        newTotalReceived,
        lastAdMilestoneShown,
      );
    } catch (error) {
      set({
        records,
        totalPaid,
        totalReceived,
        lastAdMilestoneShown,
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
      await recordService.updateRecord(
        userIdentifier,
        id,
        updates,
        nextPaid,
        nextReceived,
      );
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

    const nextPaid =
      target.mode === "paid"
        ? Math.max(0, totalPaid - target.amount)
        : totalPaid;
    const nextReceived =
      target.mode === "received"
        ? Math.max(0, totalReceived - target.amount)
        : totalReceived;

    set({
      records: records.filter((r) => r.id !== id),
      totalPaid: nextPaid,
      totalReceived: nextReceived,
    });

    try {
      await recordService.removeRecord(
        userIdentifier,
        id,
        nextPaid,
        nextReceived,
      );
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
  RecordSlice & UISlice & AdSlice & AuthSlice,
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
 * 3. 광고 상태 슬라이스 (광고 기능 비활성화 — DB 호환을 위해 필드만 유지)
 */
interface AdSlice {
  lastAdMilestoneShown: number;
}

const createAdSlice: StateCreator<
  RecordSlice & UISlice & AdSlice & AuthSlice,
  [["zustand/persist", unknown]],
  [],
  AdSlice
> = () => ({
  lastAdMilestoneShown: 0,
});

/**
 * 4. 인증 상태 슬라이스
 */
interface AuthSlice {
  tossUser: TossUserMeResponse | null;
  isLoggingIn: boolean;
  login: () => Promise<void>;
}

const createAuthSlice: StateCreator<
  RecordSlice & UISlice & AdSlice & AuthSlice,
  [["zustand/persist", unknown]],
  [],
  AuthSlice
> = (set, get) => ({
  tossUser: null,
  isLoggingIn: false,
  login: async () => {
    set({ isLoggingIn: true });
    try {
      const user = await tossAuthService.executeFullLogin();
      const userKeyStr = user.userKey;

      // DB 쓰기가 성공한 후에만 tossUser를 커밋.
      // 중간 실패 시 "연결됨" UI가 잠깐 노출되는 flicker 방지.

      // 1. 해당 tossId(userKey)를 가진 기존 유저가 있는지 확인
      const existingUser = await recordService.findUserByTossId(userKeyStr);

      if (existingUser) {
        // 레코드 재조회 후 한 번에 커밋
        const { fetchedRecords, lastVisible } =
          await recordService.fetchRecordsPage(existingUser.uid);
        set({
          tossUser: user,
          userIdentifier: existingUser.uid,
          totalPaid:
            existingUser.data.totalPaid || existingUser.data.totalAmount || 0,
          totalReceived: existingUser.data.totalReceived || 0,
          lastAdMilestoneShown: existingUser.data.lastAdMilestoneShown || 0,
          records: fetchedRecords,
          lastVisible,
          hasMore: fetchedRecords.length === 20,
        });
      } else {
        // 2. 기존 유저가 없다면 현재 익명 유저 문서를 토스 계정으로 연결
        const userIdentifier = get().userIdentifier;
        if (!userIdentifier) {
          throw new Error("인증 정보가 없어 연결할 수 없습니다.");
        }
        await recordService.updateUserTossId(userIdentifier, userKeyStr);
        set({ tossUser: user });
      }
    } catch (error) {
      console.error(
        "[AuthStore] Login failed:",
        error instanceof Error ? error.message : "unknown",
      );
      // 성공 경로에 도달하지 못했으므로 tossUser는 이미 null 유지 중.
      // 안전 장치로 한 번 더 명시.
      set({ tossUser: null });
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },
});

/**
 * 최종 스토어 구성
 */
export const useRecordStore = create<
  RecordSlice & UISlice & AdSlice & AuthSlice
>()(
  persist(
    (...a) => ({
      ...createRecordSlice(...a),
      ...createUISlice(...a),
      ...createAdSlice(...a),
      ...createAuthSlice(...a),
    }),
    {
      name: "howmuch-records-storage-v4",
      version: 4,
      partialize: (state) => ({
        lastAdMilestoneShown: state.lastAdMilestoneShown,
        currentMode: state.currentMode,
        tossUser: state.tossUser,
      }),
      onRehydrateStorage: () => (state) => {
        // persist된 lastAdMilestoneShown은 0으로 초기화.
        // initializeStore가 서버에서 실제 값을 가져오면 덮어씀.
        // records가 복원되지 않는 상태에서 이전 마일스톤을 유지하면
        // 광고 마일스톤 계산이 영구히 꼬일 수 있어 런타임 초기화가 안전함.
        if (state) {
          state.lastAdMilestoneShown = 0;
          state.modeTogglePulse = false;

          // 레거시 버전에서 저장된 숫자 형태의 userKey는 현재 스키마와 호환되지 않으므로 정리.
          const key = state.tossUser?.userKey;
          const isValidKey = typeof key === "string" && key.length > 0;
          if (state.tossUser && !isValidKey) {
            state.tossUser = null;
          }
        }
      },
    },
  ),
);
