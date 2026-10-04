import { useMemo, useState } from "react";
import type { MoneyRecord } from "@/types/record";

export const normalizeName = (value: string) => value.trim().normalize("NFC").toLocaleLowerCase();

export function searchPeople(records: MoneyRecord[], query: string) {
  const normalized = normalizeName(query);
  if (!normalized) return [];
  const groups = new Map<string, { key: string; name: string; relation: string; records: MoneyRecord[];
    totalPaid: number; totalReceived: number }>();
  for (const record of records) {
    if (!normalizeName(record.name).includes(normalized)) continue;
    const key = JSON.stringify([normalizeName(record.name), record.relation.trim()]);
    const group = groups.get(key) ?? { key, name: record.name.trim(), relation: record.relation,
      records: [], totalPaid: 0, totalReceived: 0 };
    group.records.push(record);
    if (record.mode === "paid") group.totalPaid += record.amount;
    else group.totalReceived += record.amount;
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => ({ ...group, records: group.records.sort((a, b) =>
    b.date.localeCompare(a.date) || (b.createdAt ?? "").localeCompare(a.createdAt ?? "")),
  })).sort((a, b) => a.name.localeCompare(b.name) || a.relation.localeCompare(b.relation));
}

export function usePeopleSearch(records: MoneyRecord[]) {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => searchPeople(records, query), [records, query]);
  return { query, setQuery, groups, isSearching: !!query.trim() };
}
