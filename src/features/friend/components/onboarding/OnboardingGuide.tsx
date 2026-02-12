import { useState, useEffect, useRef } from "react";
import { Text, Asset, Spacing } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_THEMES } from "../../constants/category";
import { MeltEffect } from "./MeltEffect";
import { OnboardingModal } from "./OnboardingModal";

const SAMPLE_FRIEND = {
  name: "김토스",
  type: "용돈" as const,
  amount: 50000,
};

interface SampleCardProps {
  theme: (typeof CATEGORY_THEMES)[keyof typeof CATEGORY_THEMES];
}

function SampleCard({ theme }: SampleCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 12px 20px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 8, left: 8, padding: 4 }}>
        <Asset.Icon
          name="icon-star-blue"
          frameShape={Asset.frameShape.CleanW16}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          padding: "3px 6px",
          borderRadius: 10,
          fontSize: 11,
          fontWeight: "bold",
          backgroundColor: `${theme.defaultBadgeColor}15`,
          color: theme.defaultBadgeColor,
          border: `1px solid ${theme.defaultBadgeColor}30`,
        }}
      >
        {theme.badgeText}
      </div>
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Asset.Icon
          name="icon-face-cap"
          frameShape={Asset.frameShape.CleanW60}
        />
      </div>
      <Spacing size={12} />
      <Text typography="t7" fontWeight="bold" color={adaptive.grey800}>
        {SAMPLE_FRIEND.name}
      </Text>
      <Text
        typography="t7"
        color={adaptive.blue600}
        fontWeight="bold"
        style={{ marginTop: 4 }}
      >
        {SAMPLE_FRIEND.amount.toLocaleString()}원
      </Text>
    </div>
  );
}

const STORAGE_KEY = "howmuch_onboarding_dismiss_count";
const MAX_DISMISS = 300;

function getDismissCount(): number {
  try {
    return Number(localStorage.getItem(STORAGE_KEY) || 0);
  } catch {
    return 0;
  }
}

function incrementDismissCount(): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(getDismissCount() + 1));
  } catch {
    // localStorage 접근 불가 시 무시
  }
}

interface OnboardingGuideProps {
  onAddFriend: () => void;
}

export function OnboardingGuide({ onAddFriend }: OnboardingGuideProps) {
  const [dismissed, setDismissed] = useState(() => getDismissCount() >= MAX_DISMISS);
  const [phase, setPhase] = useState<"card" | "melting" | "modal">("card");
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);

  // 카드 등장 후 녹기 시작
  useEffect(() => {
    if (dismissed) return;
    const timer = setTimeout(() => {
      if (cardRef.current) {
        setCardRect(cardRef.current.getBoundingClientRect());
      }
      setPhase("melting");
    }, 600);
    return () => clearTimeout(timer);
  }, [dismissed]);

  // 녹는 중 → 모달
  useEffect(() => {
    if (phase !== "melting") return;
    const timer = setTimeout(() => setPhase("modal"), 2000);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleDismiss = () => {
    incrementDismissCount();
    setDismissed(true);
  };
  const handleStart = () => {
    // 시작하면 최대치로 설정 → 다시 안 뜸
    try { localStorage.setItem(STORAGE_KEY, String(MAX_DISMISS)); } catch { /* noop */ }
    setDismissed(true);
    onAddFriend();
  };

  if (dismissed) return null;

  const theme = CATEGORY_THEMES[SAMPLE_FRIEND.type];

  return (
    <>
      {/* Phase 1: 샘플 카드 */}
      <AnimatePresence>
        {phase === "card" && (
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              backgroundColor: theme.lightColor,
              borderRadius: "24px",
              border: `1px solid ${theme.color}40`,
              position: "relative",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
              height: "160px",
              // overflow: "hidden" // 내부 요소가 잘리지 않게 조정
            }}
          >
            <SampleCard theme={theme} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: 녹아내리기 연출 */}
      {phase === "melting" && cardRect && (
        <MeltEffect
          cardRect={cardRect}
          color={theme.color}
          bgColor={theme.lightColor}
          borderColor={theme.color}
        >
          <SampleCard theme={theme} />
        </MeltEffect>
      )}

      {/* Phase 3: 하단 모달 */}
      <AnimatePresence>
        {phase === "modal" && (
          <OnboardingModal onDismiss={handleDismiss} onStart={handleStart} />
        )}
      </AnimatePresence>
    </>
  );
}
