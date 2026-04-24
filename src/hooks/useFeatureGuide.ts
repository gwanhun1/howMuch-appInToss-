import { useState, useCallback, useEffect } from "react";

export type GuideStep = "add-button" | "form-all" | "mode-toggle" | null;

export const STEP_ORDER: Exclude<GuideStep, null>[] = [
  "add-button",
  "form-all",
  "mode-toggle",
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

export const FORM_STEPS: Set<Exclude<GuideStep, null>> = new Set(["form-all"]);

export interface GuideProps {
  currentStep: GuideStep;
  next: () => void;
  skip: () => void;
  /** add-button 끝난 뒤 바텀시트를 열고 폼 가이드로 전환 */
  isWaitingForForm: boolean;
  startFormGuide: () => void;
  /** 가이드 준비 중 (데이터 로딩 전) */
  isPreparingGuide: boolean;
}

export function useFeatureGuide(onGuideEnd?: () => void): GuideProps {
  const [currentStep, setCurrentStep] = useState<GuideStep>(null);
  const [isWaitingForForm, setIsWaitingForForm] = useState(false);
  const [isPreparingGuide, setIsPreparingGuide] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "true") {
        setIsPreparingGuide(false);
        return;
      }
    } catch {
      // noop
    }
    const timer = setTimeout(() => {
      setCurrentStep("add-button");
      setIsPreparingGuide(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const next = useCallback(() => {
    setCurrentStep((prev) => {
      const idx = STEP_ORDER.indexOf(prev as Exclude<GuideStep, null>);
      if (idx < 0 || idx >= STEP_ORDER.length - 1) {
        markGuideDone();
        onGuideEnd?.();
        return null;
      }
      const nextStep = STEP_ORDER[idx + 1];
      if (prev === "add-button" && nextStep === "form-all") {
        setIsWaitingForForm(true);
        return null;
      }
      const wasForm = FORM_STEPS.has(prev as Exclude<GuideStep, null>);
      const isForm = FORM_STEPS.has(nextStep);
      if (wasForm && !isForm) {
        onGuideEnd?.();
      }
      return nextStep;
    });
  }, [onGuideEnd]);

  const skip = useCallback(() => {
    markGuideDone();
    onGuideEnd?.();
    setIsWaitingForForm(false);
    setCurrentStep(null);
  }, [onGuideEnd]);

  const startFormGuide = useCallback(() => {
    if (!isWaitingForForm) return;
    setIsWaitingForForm(false);
    setTimeout(() => setCurrentStep("form-all"), 400);
  }, [isWaitingForForm]);

  return {
    currentStep,
    next,
    skip,
    isWaitingForForm,
    startFormGuide,
    isPreparingGuide,
  };
}
