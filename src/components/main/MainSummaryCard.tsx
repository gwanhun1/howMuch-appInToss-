import { useMemo } from "react";
import { Asset, useToast } from "@toss/tds-mobile";
import { motion } from "framer-motion";
import type { RecordType } from "../../types/record";
import { useRecordStore } from "../../stores/useRecordStore";
import { ModeToggle } from "./ModeToggle";
import { CategoryFilterBadge } from "./CategoryFilterBadge";
import { TotalAmountBadge } from "./TotalAmountBadge";
import { FeatureHighlight } from "../onboarding/FeatureHighlight";
import type { GuideProps } from "../../hooks/useFeatureGuide";

type IconName = Parameters<typeof Asset.Icon>[0]["name"];

interface MainSummaryCardProps {
  totalAmount: number;
  isLoading: boolean;
  recordsCount: number;
  filterType: RecordType | "전체";
  onFilterChange: (type: RecordType | "전체") => void;
  guide: GuideProps;
}

export function MainSummaryCard({
  totalAmount,
  isLoading,
  recordsCount,
  filterType,
  onFilterChange,
  guide,
}: MainSummaryCardProps) {
  const { records, currentMode, setCurrentMode, tossUser, login, isLoggingIn } =
    useRecordStore();
  const { openToast } = useToast();

  const handleTossLogin = async () => {
    try {
      await login();
      openToast("데이터가 안전하게 연동되었습니다.");
    } catch (error) {
      console.error("Login failed:", error);
      openToast("로그인에 실패했습니다.");
    }
  };

  const modeRecords = useMemo(
    () => records.filter((r) => r.mode === currentMode),
    [records, currentMode],
  );

  return (
    <div
      style={{ position: "relative", overflow: "visible", padding: "0 20px" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <FeatureHighlight
          step="mode-toggle"
          currentStep={guide.currentStep}
          onNext={guide.next}
        >
          <div style={{ display: "inline-block" }}>
            <ModeToggle
              currentMode={currentMode}
              onModeChange={setCurrentMode}
            />
          </div>
        </FeatureHighlight>

        {/* 토스 로그인/백업 버튼 - 후광 및 애니메이션 효과 적용 */}
        <div style={{ position: "relative" }}>
          <FeatureHighlight
            step="data-backup"
            currentStep={guide.currentStep}
            onNext={guide.next}
          >
            <motion.button
              onClick={handleTossLogin}
              disabled={isLoggingIn || !!tossUser}
              animate={
                !tossUser && !isLoggingIn
                  ? {
                      scale: [1, 1.05, 1],
                    }
                  : {}
              }
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                padding: 0,
                border: "none",
                background: "none",
                cursor: isLoggingIn || !!tossUser ? "default" : "pointer",
                position: "relative",
                width: "32px",
                height: "32px",
                marginTop: "4px",
                borderRadius: "50%",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* 메인 금고 아이콘 */}
                <Asset.Icon
                  name={"icon-safe-box-deepblue" as IconName}
                  frameShape={Asset.frameShape.CleanW24}
                />

                {/* 백업되지 않은 상태일 때만 열쇠 아이콘을 우측 하단에 배치 */}
                {!tossUser && !isLoggingIn && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0px",
                      right: "0px",
                      zIndex: 1,
                      transform: "scale(0.55)",
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Asset.Icon
                      name={"icon-key" as IconName}
                      frameShape={Asset.frameShape.CleanW24}
                    />
                  </div>
                )}
              </div>
            </motion.button>
          </FeatureHighlight>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "12px",
        }}
      >
        <FeatureHighlight
          step="category-filter"
          currentStep={guide.currentStep}
          onNext={guide.next}
        >
          <CategoryFilterBadge
            filterType={filterType}
            onFilterChange={onFilterChange}
          />
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
