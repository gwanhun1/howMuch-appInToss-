import { useMemo } from "react";
import type { RecordType } from "../../types/record";
import { useRecordStore } from "../../stores/useRecordStore";
import { ModeToggle } from "./ModeToggle";
import { CategoryFilterBadge } from "./CategoryFilterBadge";
import { TotalAmountBadge } from "./TotalAmountBadge";

interface MainSummaryCardProps {
  totalAmount: number;
  isLoading: boolean;
  recordsCount: number;
  filterType: RecordType | "전체";
  onFilterChange: (type: RecordType | "전체") => void;
}

export function MainSummaryCard({ totalAmount, isLoading, recordsCount, filterType, onFilterChange }: MainSummaryCardProps) {
  const { records, currentMode, setCurrentMode } = useRecordStore();

  const modeRecords = useMemo(
    () => records.filter((r) => r.mode === currentMode),
    [records, currentMode],
  );

  return (
    <div style={{ position: "relative", overflow: "visible", padding: "0 20px" }}>
      <ModeToggle currentMode={currentMode} onModeChange={setCurrentMode} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
        <CategoryFilterBadge filterType={filterType} onFilterChange={onFilterChange} />
        <TotalAmountBadge
          totalAmount={totalAmount}
          isLoading={isLoading}
          recordsCount={recordsCount}
          modeRecords={modeRecords}
        />
      </div>
    </div>
  );
}
