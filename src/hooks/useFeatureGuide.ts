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

export const FORM_STEPS: Set<Exclude<GuideStep, null>> = new Set([
  "form-avatar", "form-name", "form-category", "form-amount",
]);

export interface GuideProps {
  currentStep: GuideStep;
  next: () => void;
  /** swipe-hint 끝난 뒤 바텀시트를 열고 폼 가이드로 전환 */
  isWaitingForForm: boolean;
  startFormGuide: () => void;
}

export function useFeatureGuide(isLoading: boolean, onGuideEnd?: () => void): GuideProps {
  const [currentStep, setCurrentStep] = useState<GuideStep>(null);
  const [isWaitingForForm, setIsWaitingForForm] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "true") return;
    } catch {
      // noop
    }
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
      if (prev === "swipe-hint" && nextStep === "form-avatar") {
        setIsWaitingForForm(true);
        return null;
      }
      return nextStep;
    });
  }, [onGuideEnd]);

  const startFormGuide = useCallback(() => {
    if (!isWaitingForForm) return;
    setIsWaitingForForm(false);
    setTimeout(() => setCurrentStep("form-avatar"), 400);
  }, [isWaitingForForm]);

  return { currentStep, next, isWaitingForForm, startFormGuide };
}
