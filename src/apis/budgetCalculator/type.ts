import type { RecordType } from "@/types/record";
export interface PlannedExpense {
  id: string;
  name: string;
  type: RecordType;
  amount: string;
}
export interface BudgetSummary {
  total: number;
  counts: Partial<Record<RecordType, number>>;
  invalidIds: string[];
  missingIds: string[];
  remaining: number | null;
}
