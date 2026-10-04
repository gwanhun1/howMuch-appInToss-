import type { MoneyRecord } from "@/types/record";
import type { HouseStyle, VillageDecoration, VillageDecorations, VillageResident } from "./type";

export const VILLAGE_PAGE_SIZE = 6;
export const HOUSE_STYLES: { value: HouseStyle; label: string }[] = [
  { value: "sky", label: "하늘집" }, { value: "rose", label: "꽃집" }, { value: "forest", label: "숲집" },
];
export const VILLAGE_CHARACTERS = [
  { icon: "icon-face-cap", label: "곰" }, { icon: "icon-quokka", label: "쿼카" },
  { icon: "icon-box-cat-grey-v2", label: "고양이" }, { icon: "icon-penguin-face", label: "펭귄" },
  { icon: "icon-dog-siback-face1", label: "강아지" }, { icon: "icon-emoji-pig-face", label: "돼지" },
];
const PROFILE_ICONS = [...VILLAGE_CHARACTERS.map((c) => c.icon), "icon-face-bandana", "icon-santa-face", "icon-anipang", "icon-fairy-face", "icon-emoji-angry-face-with-horns", "icon-emoji-cow-yellow", "icon-mole", "icon-king-blonde", "icon-blue-dragon"];
export function villageIcon(icon: string) {
  return PROFILE_ICONS.includes(icon) ? icon : "icon-face-cap";
}

/** 이름·관계가 같은 기록 묶음이에요. 실제 사람의 신원을 판별하지 않아요. */
export function buildVillage(records: MoneyRecord[]): VillageResident[] {
  const groups = new Map<string, MoneyRecord[]>();
  for (const record of records) {
    if (!record.name.trim()) continue;
    const key = JSON.stringify([record.name.trim().normalize("NFC"), record.relation.trim().normalize("NFC")]);
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => {
    // 최초 기록 ID를 꾸미기 키로 써서 이름·금액을 기기 설정에 저장하지 않아요.
    const anchor = [...group].sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? "") || a.id.localeCompare(b.id))[0];
    const history = [...group].sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt ?? "").localeCompare(a.createdAt ?? "") || a.id.localeCompare(b.id));
    return {
      id: anchor.id, name: history[0].name.trim(), relation: history[0].relation.trim(),
      icon: history[0].profileIcon, records: history,
      totalPaid: group.filter((r) => r.mode === "paid").reduce((sum, r) => sum + r.amount, 0),
      totalReceived: group.filter((r) => r.mode === "received").reduce((sum, r) => sum + r.amount, 0),
    };
  }).sort((a, b) => a.name.localeCompare(b.name, "ko") || a.relation.localeCompare(b.relation, "ko") || a.id.localeCompare(b.id));
}

const storageKey = (userId: string) => `howmuch-heart-village-v1:${encodeURIComponent(userId)}`;
export function loadVillageDecorations(userId: string): VillageDecorations {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(storageKey(userId)) ?? "null");
    if (!raw || typeof raw !== "object" || !("version" in raw) || raw.version !== 1 || !("items" in raw) || !raw.items || typeof raw.items !== "object") return {};
    const entries: [string, VillageDecoration][] = [];
    for (const [id, value] of Object.entries(raw.items).slice(0, 1000) as [string, unknown][]) {
      if (!value || typeof value !== "object" || !("house" in value) || !("icon" in value)) continue;
      if (typeof value.icon !== "string" || !PROFILE_ICONS.includes(value.icon)) continue;
      const house = HOUSE_STYLES.find((style) => style.value === value.house)?.value;
      if (house) entries.push([id, { house, icon: value.icon }]);
    }
    return Object.fromEntries(entries);
  } catch { return {}; }
}
export function saveVillageDecorations(userId: string, items: VillageDecorations): boolean {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify({ version: 1, items }));
    return true;
  } catch { return false; }
}
