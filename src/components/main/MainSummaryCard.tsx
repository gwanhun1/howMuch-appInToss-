import { useMemo } from "react";
import type { RecordType } from "../../types/record";
import { useRecordStore } from "../../stores/useRecordStore";
import { ModeToggle } from "./ModeToggle";
import { CategoryFilterBadge } from "./CategoryFilterBadge";
import { TotalAmountBadge } from "./TotalAmountBadge";
import { FeatureHighlight } from "../onboarding/FeatureHighlight";
import type { GuideProps } from "../../hooks/useFeatureGuide";

interface MainSummaryCardProps {
  totalAmount: number;
  isLoading: boolean;
  recordsCount: number;
  filterType: RecordType | "전체";
  onFilterChange: (type: RecordType | "전체") => void;
  guide: GuideProps;
}

export function MainSummaryCard({ totalAmount, isLoading, recordsCount, filterType, onFilterChange, guide }: MainSummaryCardProps) {
  const { records, currentMode, setCurrentMode } = useRecordStore();

  const modeRecords = useMemo(
    () => records.filter((r) => r.mode === currentMode),
    [records, currentMode],
  );

  return (
    <div style={{ position: "relative", overflow: "visible", padding: "0 20px" }}>
      <FeatureHighlight
        step="mode-toggle"
        currentStep={guide.currentStep}
        onNext={guide.next}
      >
        <ModeToggle currentMode={currentMode} onModeChange={setCurrentMode} />
      </FeatureHighlight>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
        <FeatureHighlight
          step="category-filter"
          currentStep={guide.currentStep}
          onNext={guide.next}
        >
          <CategoryFilterBadge filterType={filterType} onFilterChange={onFilterChange} />
        </FeatureHighlight>
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
