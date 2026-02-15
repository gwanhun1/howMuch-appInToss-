import { Highlight, Text, Spacing } from "@toss/tds-mobile";
import { type GuideStep, STEP_ORDER, TOTAL_STEPS } from "../../hooks/useFeatureGuide";

const STEP_MESSAGES: Record<Exclude<GuideStep, null>, string> = {
  "add-button": "여기를 눌러 경조사비를 기록해보세요",
  "mode-toggle": "보낸 돈 · 받은 돈을 전환할 수 있어요",
  "category-filter": "축의금·조의금·돌잔치·용돈별로 필터링해요",
  "swipe-hint": "좌우 스와이프로도 보낸/받은을 전환할 수 있어요",
  "form-avatar": "프로필 사진을 눌러 아이콘을 바꿀 수 있어요",
  "form-name": "이름을 입력해서 누구인지 기록해요",
  "form-category": "축의금·조의금·돌잔치·용돈 중 선택해요",
  "form-amount": "금액을 입력하면 기록 완료!",
};

const FORM_STEPS: Set<string> = new Set(["form-avatar", "form-name", "form-category", "form-amount"]);

interface FeatureHighlightProps {
  step: Exclude<GuideStep, null>;
  currentStep: GuideStep;
  onNext: () => void;
  children: React.ReactNode;
}

export function FeatureHighlight({
  step,
  currentStep,
  onNext,
  children,
}: FeatureHighlightProps) {
  const isOpen = currentStep === step;
  const isFormStep = FORM_STEPS.has(step);
  const currentIndex = STEP_ORDER.indexOf(step);
  const isLast = currentIndex === TOTAL_STEPS - 1;

  // 가이드가 완전히 끝났으면 Highlight 없이 children만 렌더링
  if (currentStep === null) {
    return <>{children}</>;
  }

  return (
    <Highlight
      open={isOpen}
      padding={10}
      highlighterClassname={isFormStep ? "highlight-above-bottomsheet" : undefined}
      message={({ style }) => (
        <div style={{
          ...style,
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 6, maxWidth: "calc(100vw - 40px)",
          textAlign: "center", wordBreak: "keep-all",
        }}>
          <Text typography="t6" fontWeight="bold" color="#fff">
            {STEP_MESSAGES[step]}
          </Text>
          <Spacing size={2} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Text typography="t7" color="rgba(255,255,255,0.45)">
              {currentIndex + 1} / {TOTAL_STEPS}
            </Text>
            <Text typography="t7" color="rgba(255,255,255,0.35)">
              {isLast ? "탭하여 완료" : "탭하여 다음"}
            </Text>
          </div>
        </div>
      )}
      onClick={onNext}
    >
      {children}
    </Highlight>
  );
}
