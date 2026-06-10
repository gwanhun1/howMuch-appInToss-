import { useMemo, useState } from "react";
import { Text, useToast } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
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
  const {
    records,
    currentMode,
    setCurrentMode,
    tossUser,
    login,
    isLoggingIn,
    modeTogglePulse,
  } = useRecordStore();
  const { openToast } = useToast();

  const handleTossLogin = async () => {
    try {
      await login();
      openToast("✓ 연결 완료! 새 폰에서도 이 기록을 볼 수 있어요");
    } catch (error) {
      console.error("Login failed:", error);
      const msg = error instanceof Error ? error.message : String(error);

      // 사용자가 의도적으로 취소
      if (/cancel|취소|dismiss|denied/i.test(msg)) return;

      // 토스 앱 WebView 밖 (개발 서버, 일반 브라우저)
      if (/TOSS_APP_ONLY/.test(msg)) {
        openToast("토스 앱 안에서만 로그인할 수 있어요");
        return;
      }

      // 네트워크 (영문·한글 둘 다)
      if (
        /network|fetch|timeout|offline|인터넷|시간이 초과|네트워크|서버에 연결/i.test(
          msg,
        )
      ) {
        openToast("네트워크 연결을 확인해주세요");
        return;
      }

      // recordService의 한글 친화 메시지면 그대로 노출
      if (msg && /^[가-힣]/.test(msg) && msg.length <= 60) {
        openToast(msg);
        return;
      }

      openToast("로그인에 실패했어요. 잠시 후 다시 시도해주세요");
    }
  };

  const modeRecords = useMemo(
    () => records.filter((r) => r.mode === currentMode),
    [records, currentMode],
  );

  const isGuiding =
    guide.currentStep !== null ||
    guide.isWaitingForForm ||
    guide.isPreparingGuide;

  // 가이드 중에는 배너를 숨김 (사용자 요청)
  const [backupCardDismissed, setBackupCardDismissed] = useState(false);
  const showBackupCard =
    !isGuiding &&
    !isLoading &&
    !tossUser &&
    !isLoggingIn &&
    records.length >= 1 &&
    !backupCardDismissed;

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

      {showBackupCard && (
        <div
          style={{
            marginTop: 12,
            position: "relative",
            backgroundColor: adaptive.blue50,
            border: `1px solid ${adaptive.blue100}`,
            borderRadius: 10,
          }}
        >
          <button
            type="button"
            onClick={handleTossLogin}
            disabled={isLoggingIn}
            style={{
              width: "100%",
              padding: "12px 40px 12px 14px",
              border: "none",
              background: "transparent",
              textAlign: "left",
              cursor: "pointer",
              minHeight: 44,
            }}
          >
            <Text
              typography="t7"
              color={adaptive.grey800}
              style={{ fontSize: 13, lineHeight: 1.4 }}
            >
              기록 {records.length}개 · 새 폰에서도 보려면{" "}
              <span style={{ color: adaptive.blue600, fontWeight: 700 }}>
                토스 연결 →
              </span>
            </Text>
          </button>
          <button
            type="button"
            onClick={() => setBackupCardDismissed(true)}
            aria-label="닫기"
            style={{
              position: "absolute",
              top: "50%",
              right: 4,
              transform: "translateY(-50%)",
              width: 32,
              height: 32,
              border: "none",
              background: "transparent",
              color: adaptive.grey400,
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
      )}

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
