import { useMemo } from "react";
import { motion } from "framer-motion";
import type { RecordType } from "../../types/record";
import { useRecordStore } from "../../stores/useRecordStore";
import { ModeToggle } from "./ModeToggle";
import { CategoryFilterBadge } from "./CategoryFilterBadge";
import { TotalAmountBadge } from "./TotalAmountBadge";
import { ViewModeToggle } from "./ViewModeToggle";
import { FeatureHighlight } from "../onboarding/FeatureHighlight";
import type { GuideProps } from "../../hooks/useFeatureGuide";

type ViewMode = "card" | "list";

interface MainSummaryCardProps {
  totalAmount: number;
  isLoading: boolean;
  recordsCount: number;
  filterType: RecordType | "전체";
  onFilterChange: (type: RecordType | "전체") => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  guide: GuideProps;
}

export function MainSummaryCard({
  totalAmount,
  isLoading,
  recordsCount,
  filterType,
  onFilterChange,
  viewMode,
  onViewModeChange,
  guide,
}: MainSummaryCardProps) {
  const { records, currentMode, setCurrentMode, modeTogglePulse } =
    useRecordStore();

  const modeRecords = useMemo(
    () => records.filter((r) => r.mode === currentMode),
    [records, currentMode],
  );

  const isGuiding =
    guide.currentStep !== null ||
    guide.isWaitingForForm ||
    guide.isPreparingGuide;

  return (
    <div
      style={{ position: "relative", overflow: "visible", padding: "0 20px" }}
    >
      {/* ModeToggle + 총액 한 라인. 좁은 너비 대응 위해 만원 단위로 표시. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          minHeight: 44,
        }}
      >
        <FeatureHighlight
          step="mode-toggle"
          currentStep={guide.currentStep}
          onNext={guide.next}
          onSkip={guide.skip}
        >
          <motion.div
            style={{ display: "inline-block" }}
            animate={modeTogglePulse ? { scale: [1, 1.03, 1] } : { scale: 1 }}
            transition={
              modeTogglePulse
                ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.2 }
            }
          >
            <ModeToggle
              currentMode={currentMode}
              onModeChange={setCurrentMode}
            />
          </motion.div>
        </FeatureHighlight>

        <div
          style={{
            flexShrink: 0,
            visibility: isLoading || isGuiding ? "hidden" : "visible",
          }}
        >
          <TotalAmountBadge
            totalAmount={totalAmount}
            isLoading={isLoading}
            recordsCount={recordsCount}
            modeRecords={modeRecords}
          />
        </div>
      </div>

      {/* 카테고리 필터 + 보기 모드 토글 */}
      {modeRecords.length >= 5 && !isGuiding && !isLoading && (
        <div
          style={{
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <CategoryFilterBadge
            filterType={filterType}
            onFilterChange={onFilterChange}
          />
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
          />
        </div>
      )}
    </div>
  );
}
