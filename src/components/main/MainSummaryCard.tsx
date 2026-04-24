import { useMemo, useState } from "react";
import { Asset, Text, useToast } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
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
      openToast("데이터가 안전하게 연동되었습니다.");
    } catch (error) {
      console.error("Login failed:", error);
      const msg = error instanceof Error ? error.message : String(error);
      if (/cancel|취소|dismiss/i.test(msg)) {
        // 사용자가 의도적으로 취소한 경우는 조용히 무시
        return;
      }
      if (/network|fetch|timeout|offline/i.test(msg)) {
        openToast("네트워크 연결을 확인해주세요");
      } else {
        openToast("로그인에 실패했어요. 잠시 후 다시 시도해주세요");
      }
    }
  };

  const modeRecords = useMemo(
    () => records.filter((r) => r.mode === currentMode),
    [records, currentMode],
  );

  // 첫 기록 직후(1~2개) · 미로그인 · 세션 내 닫기 전에만 노출되는 보관 유도 배너.
  // 3개 도달 시엔 handleSave의 백업 토스트(A2)와 겹치지 않도록 자동 사라짐.
  const [backupCardDismissed, setBackupCardDismissed] = useState(false);
  const showBackupCard =
    !tossUser &&
    !isLoggingIn &&
    records.length >= 1 &&
    records.length < 3 &&
    !backupCardDismissed;

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
          onSkip={guide.skip}
        >
          <motion.div
            style={{ display: "inline-block" }}
            animate={
              modeTogglePulse
                ? { scale: [1, 1.03, 1] }
                : { scale: 1 }
            }
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

        {/* 토스 연결(로그인) pill - 아이콘+"토스 연결" 라벨로 의미 명확화 */}
        <motion.button
          onClick={handleTossLogin}
          disabled={isLoggingIn || !!tossUser}
          aria-label={tossUser ? "토스 연결됨" : "토스에 연결하기"}
          animate={
            !tossUser && !isLoggingIn
              ? { scale: [1, 1.04, 1] }
              : { scale: 1 }
          }
          transition={
            !tossUser && !isLoggingIn
              ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "0 12px 0 10px",
            height: 36,
            minWidth: 44,
            marginTop: 4,
            border: `1px solid ${
              tossUser ? adaptive.grey200 : adaptive.blue200
            }`,
            borderRadius: 18,
            backgroundColor: tossUser ? adaptive.grey50 : adaptive.blue50,
            color: tossUser ? adaptive.grey600 : adaptive.blue600,
            cursor: isLoggingIn || !!tossUser ? "default" : "pointer",
          }}
        >
          <Asset.Icon
            name={
              (tossUser
                ? "icon-check-mono"
                : "icon-safe-box-deepblue") as IconName
            }
            size={16}
          />
          <Text
            typography="t7"
            fontWeight="bold"
            color={tossUser ? adaptive.grey600 : adaptive.blue600}
            style={{ fontSize: 13, lineHeight: 1 }}
          >
            {tossUser ? "연결됨" : "토스 연결"}
          </Text>
        </motion.button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "12px",
        }}
      >
        {modeRecords.length >= 5 ? (
          <CategoryFilterBadge
            filterType={filterType}
            onFilterChange={onFilterChange}
          />
        ) : (
          <span />
        )}
        <TotalAmountBadge
          totalAmount={totalAmount}
          isLoading={isLoading}
          recordsCount={recordsCount}
          modeRecords={modeRecords}
        />
      </div>

      {showBackupCard && (
        <div
          style={{
            marginTop: 12,
            padding: "14px 12px 14px 14px",
            borderRadius: 14,
            backgroundColor: adaptive.blue50,
            border: `1px solid ${adaptive.blue100}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: adaptive.blue100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Asset.Icon
              name={"icon-safe-box-deepblue" as IconName}
              size={20}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text
              typography="t7"
              fontWeight="bold"
              color={adaptive.grey900}
              style={{ display: "block", fontSize: 14 }}
            >
              토스에 연결하면 더 안전해요
            </Text>
            <Text
              typography="t7"
              color={adaptive.grey700}
              style={{ display: "block", fontSize: 13, marginTop: 2 }}
            >
              기기를 바꿔도 기록이 그대로 유지돼요
            </Text>
          </div>
          <button
            type="button"
            onClick={handleTossLogin}
            disabled={isLoggingIn}
            style={{
              padding: "10px 14px",
              borderRadius: 20,
              border: "none",
              backgroundColor: adaptive.blue600,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              minHeight: 40,
              whiteSpace: "nowrap",
              marginRight: 4,
            }}
          >
            연결하기
          </button>
          <button
            type="button"
            onClick={() => setBackupCardDismissed(true)}
            aria-label="닫기"
            style={{
              width: 44,
              height: 44,
              border: "none",
              background: "transparent",
              color: adaptive.grey500,
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
