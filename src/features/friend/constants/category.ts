import { adaptive } from "@toss/tds-colors";
import type { FriendType } from "../types/friend";

export const FRIEND_CATEGORIES = {
  ALL: "전체",
  WEDDING: "축의금",
  FUNERAL: "조의금",
  DOL: "돌잔치",
} as const;

export interface CategoryInfo {
  label: FriendType | "전체";
  color: string;
  lightColor: string;
  badgeText: string;
  defaultBadgeColor: string;
}

export const CATEGORY_THEMES: Record<string, CategoryInfo> = {
  [FRIEND_CATEGORIES.ALL]: {
    label: "전체",
    color: "#3182f6",
    lightColor: "rgba(49, 130, 246, 0.06)",
    badgeText: "전체",
    defaultBadgeColor: adaptive.blue600,
  },
  [FRIEND_CATEGORIES.WEDDING]: {
    label: "축의금",
    color: "#FF4B78",
    lightColor: "#FFF2F6",
    badgeText: "축",
    defaultBadgeColor: "#FF4B78",
  },
  [FRIEND_CATEGORIES.FUNERAL]: {
    label: "조의금",
    color: adaptive.grey600,
    lightColor: "#F8F9FA",
    badgeText: "조",
    defaultBadgeColor: adaptive.grey600,
  },
  [FRIEND_CATEGORIES.DOL]: {
    label: "돌잔치",
    color: "#FFB900",
    lightColor: "#FFFBEB",
    badgeText: "돌",
    defaultBadgeColor: "#FFB900",
  },
};
