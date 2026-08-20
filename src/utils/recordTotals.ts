import type { MoneyRecord, RecordMode } from "../types/record";

export interface RecordTotals {
  totalPaid: number;
  totalReceived: number;
}

export function applyRecordDelta(
  totals: RecordTotals,
  previous: Pick<MoneyRecord, "mode" | "amount"> | null,
  next: Pick<MoneyRecord, "mode" | "amount"> | null,
): RecordTotals {
  let totalPaid = totals.totalPaid;
  let totalReceived = totals.totalReceived;

  const subtract = (mode: RecordMode, amount: number) => {
    if (mode === "paid") totalPaid -= amount;
    else totalReceived -= amount;
  };
  const add = (mode: RecordMode, amount: number) => {
    if (mode === "paid") totalPaid += amount;
    else totalReceived += amount;
  };

  if (previous) subtract(previous.mode, previous.amount);
  if (next) add(next.mode, next.amount);

  return {
    totalPaid: Math.max(0, totalPaid),
    totalReceived: Math.max(0, totalReceived),
  };
}
