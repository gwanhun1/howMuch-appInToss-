import { useState, useCallback, useEffect } from "react";

export type GuideStep =
  | "add-button"
  | "mode-toggle"
  | "category-filter"
  | "swipe-hint"
  | "form-avatar"
  | "form-name"
  | "form-category"
  | "form-amount"
  | null;

export const STEP_ORDER: Exclude<GuideStep, null>[] = [
  "add-button",
  "mode-toggle",
  "category-filter",
  "swipe-hint",
  "form-avatar",
  "form-name",
  "form-category",
  "form-amount",
];

export const TOTAL_STEPS = STEP_ORDER.length;

const STORAGE_KEY = "howmuch_feature_guide_done";

function markGuideDone(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // noop
  }
}

export interface GuideProps {
  currentStep: GuideStep;
  next: () => void;
  prev: () => void;
  skip: () => void;
  /** swipe-hint 끝난 뒤 바텀시트를 열고 폼 가이드로 전환 */
  isWaitingForForm: boolean;
  startFormGuide: () => void;
}

export function useFeatureGuide(isLoading: boolean, onGuideEnd?: () => void): GuideProps {
  const [currentStep, setCurrentStep] = useState<GuideStep>(null);
  const [isWaitingForForm, setIsWaitingForForm] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => setCurrentStep("add-button"), 800);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const next = useCallback(() => {
    setCurrentStep((prev) => {
      const idx = STEP_ORDER.indexOf(prev as Exclude<GuideStep, null>);
      if (idx < 0 || idx >= STEP_ORDER.length - 1) {
        markGuideDone();
        onGuideEnd?.();
        return null;
      }
      const nextStep = STEP_ORDER[idx + 1];
      // swipe-hint → form-avatar 전환 시, 바텀시트가 열려야 하므로 대기
      if (prev === "swipe-hint" && nextStep === "form-avatar") {
        setIsWaitingForForm(true);
        return null; // 일단 null로 두고 바텀시트 열린 뒤 startFormGuide로 재개
      }
      return nextStep;
    });
  }, [onGuideEnd]);

  const prev = useCallback(() => {
    setCurrentStep((prev) => {
      const idx = STEP_ORDER.indexOf(prev as Exclude<GuideStep, null>);
      if (idx <= 0) return prev;
      return STEP_ORDER[idx - 1];
    });
  }, []);

  const skip = useCallback(() => {
    markGuideDone();
    setCurrentStep(null);
    setIsWaitingForForm(false);
    onGuideEnd?.();
  }, [onGuideEnd]);

  /** 바텀시트가 열린 뒤 호출 — 폼 가이드 시작 */
  const startFormGuide = useCallback(() => {
    if (!isWaitingForForm) return;
    setIsWaitingForForm(false);
    setTimeout(() => setCurrentStep("form-avatar"), 400);
  }, [isWaitingForForm]);

  return { currentStep, next, prev, skip, isWaitingForForm, startFormGuide };
}
