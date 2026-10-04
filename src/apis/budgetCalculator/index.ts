import type { BudgetSummary, PlannedExpense } from "./type";
export const MAX_RECORD_AMOUNT = 100000000;
export const MAX_PLAN_ROWS = 50;

/** 금액을 검증하고 미입력·범위 밖 금액을 유효한 0원으로 취급하지 않는다. */
export function parseExpenseAmount(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const amount = Number(value);
  return Number.isSafeInteger(amount) && amount > 0 && amount <= MAX_RECORD_AMOUNT ? amount : null;
}

export function calculateBudget(rows: PlannedExpense[], budget: string): BudgetSummary {
  const summary: BudgetSummary = { total: 0, counts: {}, invalidIds: [], missingIds: [], remaining: null };
  for (const row of rows) {
    summary.counts[row.type] = (summary.counts[row.type] ?? 0) + 1;
    const amount = parseExpenseAmount(row.amount);
    if (!row.amount) summary.missingIds.push(row.id);
    else if (amount === null) summary.invalidIds.push(row.id);
    else summary.total += amount;
  }
  const parsedBudget = parseExpenseAmount(budget);
  if (parsedBudget !== null && !summary.invalidIds.length && !summary.missingIds.length) {
    summary.remaining = parsedBudget - summary.total;
  }
  return summary;
}

export function getCurrentSeoulMonth(): string {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit" }).formatToParts(new Date());
  return `${parts.find((p) => p.type === "year")?.value}-${parts.find((p) => p.type === "month")?.value}`;
}
