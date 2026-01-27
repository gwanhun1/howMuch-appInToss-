import { create } from "zustand";
import type { Friend } from "@/types/friend";

interface FriendStore {
  friends: Friend[];
  selectedFriendId: string | null;
  currentPage: "main" | "amountInput";
  isFriendFormOpen: boolean;
  isProfileImageSheetOpen: boolean;
  addFriend: (friend: Friend) => void;
  updateFriend: (id: string, updates: Partial<Friend>) => void;
  setSelectedFriendId: (id: string | null) => void;
  openFriendForm: (id: string) => void;
  closeFriendForm: () => void;
  openProfileImageSheet: () => void;
  closeProfileImageSheet: () => void;
  openAmountInput: () => void;
  closeAmountInput: () => void;
  resetToMain: () => void;
}

export const useFriendStore = create<FriendStore>((set) => ({
  friends: [
    {
      id: "1",
      name: "김토스",
      profileIcon: "icon-person-1-color",
      type: "축의금",
      amount: 50000,
      relation: "친구",
      date: "2026-03-01",
    },
    {
      id: "2",
      name: "이토스",
      profileIcon: "icon-person-2-color",
      type: "축의금",
      amount: 100000,
      relation: "가족",
      date: "2026-03-02",
    },
    {
      id: "3",
      name: "박토스",
      profileIcon: "icon-person-3-color",
      type: "조의금",
      amount: 50000,
      relation: "직장",
      date: "2026-03-03",
    },
    {
      id: "4",
      name: "최토스",
      profileIcon: "icon-person-4-color",
      type: "축의금",
      amount: 30000,
      relation: "친구",
      date: "2026-03-04",
    },
    {
      id: "5",
      name: "정토스",
      profileIcon: "icon-person-5-color",
      type: "축의금",
      amount: 70000,
      relation: "지인",
      date: "2026-03-05",
    },
    {
      id: "6",
      name: "강토스",
      profileIcon: "icon-person-6-color",
      type: "조의금",
      amount: 50000,
      relation: "동료",
      date: "2026-03-06",
    },
    {
      id: "7",
      name: "조토스",
      profileIcon: "icon-person-7-color",
      type: "축의금",
      amount: 50000,
      relation: "친구",
      date: "2026-03-07",
    },
    {
      id: "8",
      name: "윤토스",
      profileIcon: "icon-person-8-color",
      type: "축의금",
      amount: 150000,
      relation: "가족",
      date: "2026-03-08",
    },
    {
      id: "9",
      name: "장토(스)",
      profileIcon: "icon-person-9-color",
      type: "축의금",
      amount: 50000,
      relation: "지인",
      date: "2026-03-09",
    },
    {
      id: "10",
      name: "임토스",
      profileIcon: "icon-person-10-color",
      type: "조의금",
      amount: 30000,
      relation: "친구",
      date: "2026-03-10",
    },
    {
      id: "11",
      name: "한토스",
      profileIcon: "icon-person-11-color",
      type: "축의금",
      amount: 50000,
      relation: "지인",
      date: "2026-03-11",
    },
    {
      id: "12",
      name: "오토스",
      profileIcon: "icon-person-12-color",
      type: "축의금",
      amount: 100000,
      relation: "친구",
      date: "2026-03-12",
    },
    {
      id: "13",
      name: "서토스",
      profileIcon: "icon-person-1-color",
      type: "조의금",
      amount: 50000,
      relation: "직장",
      date: "2026-03-13",
    },
    {
      id: "14",
      name: "신토스",
      profileIcon: "icon-person-2-color",
      type: "축의금",
      amount: 30000,
      relation: "친구",
      date: "2026-03-14",
    },
    {
      id: "15",
      name: "권토스",
      profileIcon: "icon-person-3-color",
      type: "축의금",
      amount: 50000,
      relation: "지인",
      date: "2026-03-15",
    },
    {
      id: "16",
      name: "황토스",
      profileIcon: "icon-person-4-color",
      type: "조의금",
      amount: 50000,
      relation: "친구",
      date: "2026-03-16",
    },
    {
      id: "17",
      name: "안토스",
      profileIcon: "icon-person-5-color",
      type: "축의금",
      amount: 200000,
      relation: "가족",
      date: "2026-03-17",
    },
    {
      id: "18",
      name: "송토스",
      profileIcon: "icon-person-6-color",
      type: "축의금",
      amount: 50000,
      relation: "지인",
      date: "2026-03-18",
    },
    {
      id: "19",
      name: "전토스",
      profileIcon: "icon-person-7-color",
      type: "조의금",
      amount: 50000,
      relation: "직장",
      date: "2026-03-19",
    },
    {
      id: "20",
      name: "홍토스",
      profileIcon: "icon-person-8-color",
      type: "축의금",
      amount: 50000,
      relation: "친구",
      date: "2026-03-20",
    },
  ],
  selectedFriendId: null,
  currentPage: "main",
  isFriendFormOpen: false,
  isProfileImageSheetOpen: false,
  addFriend: (friend) =>
    set((state) => ({ friends: [...state.friends, friend] })),
  updateFriend: (id, updates) =>
    set((state) => ({
      friends: state.friends.map((f) =>
        f.id === id ? { ...f, ...updates } : f,
      ),
    })),
  setSelectedFriendId: (id) => set({ selectedFriendId: id }),
  openFriendForm: (id) =>
    set({ selectedFriendId: id, isFriendFormOpen: true, currentPage: "main" }),
  closeFriendForm: () => set({ isFriendFormOpen: false }),
  openProfileImageSheet: () => set({ isProfileImageSheetOpen: true }),
  closeProfileImageSheet: () => set({ isProfileImageSheetOpen: false }),
  openAmountInput: () =>
    set({ currentPage: "amountInput", isFriendFormOpen: false }),
  closeAmountInput: () => set({ currentPage: "main" }),
  resetToMain: () =>
    set({
      currentPage: "main",
      selectedFriendId: null,
      isFriendFormOpen: false,
      isProfileImageSheetOpen: false,
    }),
}));
