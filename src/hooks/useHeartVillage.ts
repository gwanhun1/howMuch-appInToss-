import { useEffect, useMemo, useRef, useState } from "react";
import { buildVillage, loadVillageDecorations, saveVillageDecorations, VILLAGE_PAGE_SIZE, villageIcon } from "@/apis/heartVillage";
import type { VillageDecoration, VillageDecorations } from "@/apis/heartVillage/type";
import type { MoneyRecord } from "@/types/record";

export function useHeartVillage(records: MoneyRecord[], userId: string | null) {
  const residents = useMemo(() => buildVillage(records), [records]);
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [settings, setSettings] = useState<{ userId: string | null; items: VillageDecorations }>({ userId: null, items: {} });
  const settingsRef = useRef(settings);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
  useEffect(() => {
    const next = { userId, items: userId ? loadVillageDecorations(userId) : {} };
    settingsRef.current = next;
    setSettings(next);
    setStorageMessage(null);
    setSelectedId(null);
    setPage(0);
  }, [userId]);
  const decorations = settings.userId === userId ? settings.items : {};
  const pageCount = Math.max(1, Math.ceil(residents.length / VILLAGE_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleResidents = residents.slice(currentPage * VILLAGE_PAGE_SIZE, (currentPage + 1) * VILLAGE_PAGE_SIZE);
  const selected = residents.find((r) => r.id === selectedId) ?? null;
  const getDecoration = (resident: typeof residents[number]): VillageDecoration =>
    decorations[resident.id] ?? { house: "sky", icon: villageIcon(resident.icon) };
  const persist = (items: VillageDecorations) => {
    if (!userId) return;
    const next = { userId, items };
    settingsRef.current = next;
    setSettings(next);
    setStorageMessage(saveVillageDecorations(userId, items) ? null : "꾸미기를 이 기기에 저장하지 못했어요. 지금 화면에서는 계속 사용할 수 있어요.");
  };
  const decorate = (patch: Partial<VillageDecoration>) => {
    if (!selected || !userId) return;
    const items = settingsRef.current.userId === userId ? settingsRef.current.items : {};
    persist({ ...items, [selected.id]: { ...(items[selected.id] ?? getDecoration(selected)), ...patch } });
  };
  const resetDecoration = () => {
    if (!selected || !userId) return;
    const items = { ...(settingsRef.current.userId === userId ? settingsRef.current.items : {}) };
    delete items[selected.id];
    persist(items);
  };
  return { residents, visibleResidents, page: currentPage, pageCount, setPage, selected,
    selectResident: setSelectedId, getDecoration, decorate, resetDecoration, storageMessage };
}
