import { adaptive } from "@toss/tds-colors";
import type { RecordType } from "../types/record";

export const RECORD_CATEGORIES = {
  ALL: "전체",
  WEDDING: "축의금",
  FUNERAL: "조의금",
  DOL: "돌잔치",
  ALLOWANCE: "용돈",
} as const;

export interface CategoryInfo {
  label: RecordType | "전체";
  color: string;
  lightColor: string;
  badgeText: string;
  defaultBadgeColor: string;
}

export const CATEGORY_THEMES: Record<string, CategoryInfo> = {
  [RECORD_CATEGORIES.ALL]: {
    label: "전체",
    color: "#3182f6",
    lightColor: "rgba(49, 130, 246, 0.06)",
    badgeText: "전체",
    defaultBadgeColor: adaptive.blue600,
  },
  [RECORD_CATEGORIES.ALLOWANCE]: {
    label: "용돈",
    color: "#3182F6",
    lightColor: "#F2F8FF",
    badgeText: "용",
    defaultBadgeColor: "#3182F6",
  },
  [RECORD_CATEGORIES.WEDDING]: {
    label: "축의금",
    color: "#FF4B78",
    lightColor: "#FFF2F6",
    badgeText: "축",
    defaultBadgeColor: "#FF4B78",
  },
  [RECORD_CATEGORIES.FUNERAL]: {
    label: "조의금",
    color: "#6B7684",
    lightColor: "#F8F9FA",
    badgeText: "조",
    defaultBadgeColor: "#6B7684",
  },
  [RECORD_CATEGORIES.DOL]: {
    label: "돌잔치",
    color: "#FFB900",
    lightColor: "#FFFBEB",
    badgeText: "돌",
    defaultBadgeColor: "#FFB900",
  },
};

/** 모드별 UI 텍스트 */
export const MODE_LABELS = {
  paid: {
    amountInputTitle: "보낸 돈 입력",
    amountInputQuestion: "이번에 얼마를 전했나요?",
    lastAmountPrefix: "지난번",
    lastAmountSuffix: "을 보내셨어요.",
    modeAmountPrefix: "주로 보내시는 금액은",
    addToast: "보낸 기록이 추가되었습니다.",
    editToast: "정보가 수정되었습니다.",
    deleteToast: "기록이 삭제되었습니다.",
  },
  received: {
    amountInputTitle: "받은 돈 입력",
    amountInputQuestion: "이번에 얼마를 받았나요?",
    lastAmountPrefix: "지난번",
    lastAmountSuffix: "을 받으셨어요.",
    modeAmountPrefix: "주로 받으시는 금액은",
    addToast: "받은 기록이 추가되었습니다.",
    editToast: "정보가 수정되었습니다.",
    deleteToast: "기록이 삭제되었습니다.",
  },
} as const;
