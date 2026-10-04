import { useMemo, useState } from "react";
import { calculateBudget, getCurrentSeoulMonth, MAX_PLAN_ROWS } from "@/apis/budgetCalculator";
import type { PlannedExpense } from "@/apis/budgetCalculator/type";
import type { GuidedRecordDraft } from "@/types/record";

function newPlan(): PlannedExpense {
  return { id: crypto.randomUUID(), name: "", type: "축의금", amount: "" };
}
export function useBudgetCalculator() {
  const [month, setMonth] = useState(getCurrentSeoulMonth);
  const [budget, setBudget] = useState("");
  const [rows, setRows] = useState<PlannedExpense[]>(() => [newPlan()]);
  const summary = useMemo(() => calculateBudget(rows, budget), [rows, budget]);
  const updateRow = (id: string, patch: Partial<Omit<PlannedExpense, "id">>) => {
    setRows((current) => current.map((r) => r.id === id ? { ...r, ...patch } : r));
  };
  const applyGuide = (id: string, draft: GuidedRecordDraft) => {
    updateRow(id, { amount: String(draft.amount), ...(draft.name ? { name: draft.name } : {}) });
  };
  return { month, setMonth, budget, setBudget, rows, summary, updateRow, applyGuide,
    addRow: () => setRows((current) => current.length < MAX_PLAN_ROWS ? [...current, newPlan()] : current),
    removeRow: (id: string) => setRows((current) => current.filter((r) => r.id !== id)),
  };
}
