import { useMemo, useState } from "react";
import { getAmountGuide } from "@/apis/amountGuide";
import type { GuideEvent, GuideSituation } from "@/apis/amountGuide/type";
import { useRecordStore } from "@/stores/useRecordStore";

export function useAmountGuide(initialType: GuideEvent = "축의금") {
  const [situation, setSituation] = useState<GuideSituation>({
    type: initialType, relation: "친구", closeness: "regular", attending: true,
  });
  const [name, setName] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const records = useRecordStore((s) => s.records);
  const result = useMemo(() => getAmountGuide(situation), [situation]);
  const history = useMemo(() => records.filter((r) =>
    r.type === situation.type && r.mode === "paid" && r.amount > 0,
  ).sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 3), [records, situation.type]);
  const personHistory = useMemo(() => {
    const normalized = name.trim().normalize("NFC").toLocaleLowerCase();
    return normalized ? records.filter((r) =>
      r.name.trim().normalize("NFC").toLocaleLowerCase() === normalized,
    ).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5) : [];
  }, [name, records]);
  const changeSituation = (patch: Partial<GuideSituation>) => {
    setSituation((current) => ({ ...current, ...patch }));
    setSelectedAmount(null);
  };
  return { situation, changeSituation, name, setName, result, history, personHistory,
    amount: selectedAmount ?? result.amounts[0], setSelectedAmount };
}
