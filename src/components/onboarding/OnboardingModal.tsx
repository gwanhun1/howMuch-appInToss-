import { useState, useEffect } from "react";
import { Text, Asset } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  {
    icon: "icon-face-cap" as const,
    title: "경조사비, 얼마 냈더라?",
    desc: "친구 이름과 상황만 입력하면 기록 끝",
    color: "#3182F6",
  },
  {
    icon: "icon-won-mono" as const,
    title: "다음엔 얼마가 적당할까",
    desc: "지난 기록을 보고 금액을 추천받아요",
    color: "#FF4B78",
  },
  {
    icon: "icon-star-blue" as const,
    title: "오간 마음을 한눈에",
    desc: "축의금·조의금·돌잔치·용돈 카테고리별 정리",
    color: "#FFB900",
  },
];

interface OnboardingModalProps {
  onDismiss: () => void;
  onStart: () => void;
}

export function OnboardingModal({ onDismiss, onStart }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* 딤 배경 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onDismiss}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          zIndex: 999,
        }}
      />

      {/* 모달 */}
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 1003,
          background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 100%)",
          borderRadius: "24px 24px 0 0",
          padding: "28px 24px",
          paddingBottom: "calc(28px + env(safe-area-inset-bottom))",
          boxShadow: "0 -8px 30px rgba(49, 130, 246, 0.12)",
        }}
      >
        {/* 핸들 바 */}
        <div
          style={{
            width: 36, height: 4, borderRadius: 2,
            backgroundColor: adaptive.grey200,
            margin: "0 auto 20px",
          }}
        />

        {/* 스텝 인디케이터 */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24 }}>
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === currentStep ? 20 : 6,
                backgroundColor: i === currentStep ? STEPS[currentStep].color : adaptive.grey200,
              }}
              transition={{ duration: 0.3 }}
              style={{ height: 6, borderRadius: 3 }}
            />
          ))}
        </div>

        {/* 스텝 콘텐츠 */}
        <div
          style={{
            height: 120, display: "flex",
            alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", textAlign: "center",
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: 52, height: 52, borderRadius: "50%",
                  backgroundColor: `${STEPS[currentStep].color}12`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 12,
                  border: `2px solid ${STEPS[currentStep].color}25`,
                }}
              >
                <Asset.Icon
                  name={STEPS[currentStep].icon}
                  frameShape={Asset.frameShape.CleanW24}
                  color={STEPS[currentStep].color}
                />
              </motion.div>
              <Text typography="t5" fontWeight="bold" color={adaptive.grey900}>
                {STEPS[currentStep].title}
              </Text>
              <Text typography="t7" color={adaptive.grey500} style={{ marginTop: 4 }}>
                {STEPS[currentStep].desc}
              </Text>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA 버튼 */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onDismiss}
            style={{
              flex: 1, padding: "14px 0", borderRadius: 14,
              border: `1px solid ${adaptive.grey200}`,
              backgroundColor: "transparent", color: adaptive.grey500,
              fontSize: 15, fontWeight: 600, cursor: "pointer",
            }}
          >
            닫기
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            style={{
              flex: 2, padding: "14px 0", borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #3182F6 0%, #6B5CE7 100%)",
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(49, 130, 246, 0.3)",
            }}
          >
            첫 기록 남기기
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
