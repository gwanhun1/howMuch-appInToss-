import type { MoneyRecord } from "../../types/record";

/**
 * 온보딩 가이드 중 보여줄 예시 카드 데이터
 * 실제 저장되지 않고 가이드 중에만 노출됨
 * 프로필 아이콘은 ProfileImageBottomSheet에 정의된 기존 아이콘 사용
 */
export const EXAMPLE_RECORDS: MoneyRecord[] = [
  {
    id: "example-1",
    mode: "paid",
    name: "김OO",
    profileIcon: "icon-face-cap",
    type: "축의금",
    amount: 50000,
    relation: "친구",
    date: "",
    isFavorite: true,
  },
  {
    id: "example-2",
    mode: "paid",
    name: "이OO",
    profileIcon: "icon-fairy-face",
    type: "돌잔치",
    amount: 100000,
    relation: "직장동료",
    date: "",
  },
  {
    id: "example-3",
    mode: "paid",
    name: "박OO",
    profileIcon: "icon-penguin-face",
    type: "조의금",
    amount: 30000,
    relation: "선배",
    date: "",
  },
];
