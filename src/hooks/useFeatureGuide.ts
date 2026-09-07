import { useState, useCallback } from "react";

export type GuideStep = "add-button" | "mode-toggle" | null;

export const STEP_ORDER: Exclude<GuideStep, null>[] = [
  "add-button",
  "mode-toggle",
];

export const TOTAL_STEPS = STEP_ORDER.length;

export interface GuideProps {
  currentStep: GuideStep;
  start: () => void;
  next: () => void;
  skip: () => void;
  /** 가이드 준비 중 (데이터 로딩 전) */
  isPreparingGuide: boolean;
}

export function useFeatureGuide(): GuideProps {
  const [currentStep, setCurrentStep] = useState<GuideStep>(null);
  // 첫 진입/재진입 모두 메인 화면을 유지합니다. 안내는 사용자가 요청할 때만 엽니다.
  const start = useCallback(() => {
    setCurrentStep("add-button");
  }, []);

  const next = useCallback(() => {
    setCurrentStep((prev) => {
      const idx = STEP_ORDER.indexOf(prev as Exclude<GuideStep, null>);
      if (idx < 0 || idx >= STEP_ORDER.length - 1) {
        return null;
      }
      const nextStep = STEP_ORDER[idx + 1];
      return nextStep;
    });
  }, []);

  const skip = useCallback(() => {
    setCurrentStep(null);
  }, []);

  return {
    currentStep,
    start,
    next,
    skip,
    isPreparingGuide: false,
  };
}
