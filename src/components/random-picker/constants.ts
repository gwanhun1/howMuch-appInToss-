import type { Asset } from "@toss/tds-mobile";

type IconName = Parameters<typeof Asset.Icon>[0]["name"];

export const CARD_COUNT = 5;
export const ALL_AMOUNTS = [50000, 100000, 200000, 300000, 500000];
export const INITIAL_POSITIONS = [0, 1, 2, 3, 4];

export const MESSAGES: Record<string, string> = {
  "50000": "가장 무난한 선택이에요 ☕",
  "100000": "딱 좋은 금액이에요 ✨",
  "200000": "큰 마음을 전하시네요 🎁",
  "300000": "정말 특별한 마음이에요 💎",
  "500000": "VIP급 마음이시네요 👑",
};

export const CARD_ICONS: IconName[] = [
  "icon-box-cat-grey-v2",
  "icon-quokka",
  "icon-penguin-face",
  "icon-anipang",
  "icon-blue-dragon",
];

export const PARTICLE_COLORS = [
  "#FFD700", "#FF6B6B", "#4ECDC4", "#A259FF",
  "#3182F6", "#FF9FF3", "#FFF", "#FFB900",
];
