import { Highlight, Text, Spacing } from "@toss/tds-mobile";
import {
  type GuideStep,
  STEP_ORDER,
  TOTAL_STEPS,
  FORM_STEPS,
} from "../../hooks/useFeatureGuide";

const STEP_MESSAGES: Record<Exclude<GuideStep, null>, string> = {
  "add-button": "여기를 눌러 첫 기록을 만들어보세요",
  "form-all": "이름 · 카테고리 · 금액을 차례로 입력하면 완료!",
  "mode-toggle": "보낸 마음 · 받은 마음은 여기서 전환할 수 있어요",
};

interface FeatureHighlightProps {
  step: Exclude<GuideStep, null>;
  currentStep: GuideStep;
  onNext: () => void;
  onSkip?: () => void;
  children: React.ReactNode;
}

export function FeatureHighlight({
  step,
  currentStep,
  onNext,
  onSkip,
  children,
}: FeatureHighlightProps) {
  const isOpen = currentStep === step;
  const isFormStep = FORM_STEPS.has(step);
  const currentIndex = STEP_ORDER.indexOf(step);
  const isLast = currentIndex === TOTAL_STEPS - 1;

  if (currentStep === null) {
    return <>{children}</>;
  }

  return (
    <Highlight
      open={isOpen}
      padding={10}
      highlighterClassname={
        isFormStep ? "highlight-above-bottomsheet" : undefined
      }
      message={({ style }) => (
        <div
          style={{
            ...style,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            maxWidth: "calc(100vw - 40px)",
            textAlign: "center",
            wordBreak: "keep-all",
          }}
        >
          <Text typography="t6" fontWeight="bold" color="#fff">
            {STEP_MESSAGES[step]}
          </Text>
          <Spacing size={2} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            <Text typography="t7" color="rgba(255,255,255,0.45)">
              {currentIndex + 1} / {TOTAL_STEPS}
            </Text>
            <div
              className="guide-next-button"
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onNext();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onNext();
              }}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: "6px 14px",
                borderRadius: "20px",
                cursor: "pointer",
                pointerEvents: "auto",
              }}
            >
              <Text typography="t7" color="#fff" fontWeight="bold">
                {isLast ? "완료" : "다음"}
              </Text>
            </div>
            {onSkip && !isLast && (
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSkip();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSkip();
                }}
                style={{
                  padding: "6px 10px",
                  cursor: "pointer",
                  pointerEvents: "auto",
                }}
              >
                <Text
                  typography="t7"
                  color="rgba(255,255,255,0.55)"
                  fontWeight="medium"
                >
                  건너뛰기
                </Text>
              </div>
            )}
          </div>
        </div>
      )}
      onClick={onNext}
    >
      <div style={{ position: "relative" }}>{children}</div>
    </Highlight>
  );
}
