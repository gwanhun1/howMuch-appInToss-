import { Highlight, Text, Spacing } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { type GuideStep, STEP_ORDER, TOTAL_STEPS } from "../../hooks/useFeatureGuide";

const STEP_MESSAGES: Record<Exclude<GuideStep, null>, string> = {
  "add-button": "여기를 눌러 경조사비를 기록해보세요",
  "mode-toggle": "보낸 돈 · 받은 돈을 전환할 수 있어요",
  "category-filter": "축의금·조의금·돌잔치·용돈별로 필터링해요",
  "swipe-hint": "좌우 스와이프로도 보낸/받은을 전환할 수 있어요",
  "form-avatar": "프로필 사진을 눌러 아이콘을 바꿀 수 있어요",
  "form-name": "이름을 입력해서 누구인지 기록해요",
  "form-category": "축의금·조의금·돌잔치·용돈 중 선택해요",
  "form-amount": "금액을 입력하면 기록 완료",
};

const FORM_STEPS: Set<string> = new Set(["form-avatar", "form-name", "form-category", "form-amount"]);

interface FeatureHighlightProps {
  step: Exclude<GuideStep, null>;
  currentStep: GuideStep;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  children: React.ReactNode;
}

export function FeatureHighlight({
  step,
  currentStep,
  onNext,
  onPrev,
  onSkip,
  children,
}: FeatureHighlightProps) {
  const isOpen = currentStep === step;
  const currentIndex = STEP_ORDER.indexOf(step);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === TOTAL_STEPS - 1;
  const isFormStep = FORM_STEPS.has(step);

  return (
    <Highlight
      open={isOpen}
      padding={10}
      highlighterClassname={isFormStep ? "highlight-above-bottomsheet" : undefined}
      message={({ style }) => (
        <div style={{ ...style, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, pointerEvents: "auto" }}>
          <Text typography="t6" fontWeight="bold" color="#fff">
            {STEP_MESSAGES[step]}
          </Text>
          <Spacing size={2} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Text typography="t7" color="rgba(255,255,255,0.5)">
              {currentIndex + 1} / {TOTAL_STEPS}
            </Text>
            <div style={{ display: "flex", gap: 6 }}>
              {!isFirst && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPrev(); }}
                  style={{
                    padding: "6px 12px", borderRadius: 14, border: "none",
                    backgroundColor: "rgba(255,255,255,0.15)", color: "#fff",
                    fontSize: 13, fontWeight: 500, cursor: "pointer",
                  }}
                >
                  이전
                </button>
              )}
              {!isLast && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onNext(); }}
                  style={{
                    padding: "6px 16px", borderRadius: 14, border: "none",
                    backgroundColor: adaptive.blue500, color: "#fff",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  다음
                </button>
              )}
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSkip(); }}
                style={{
                  padding: "6px 10px", borderRadius: 14, border: "none",
                  backgroundColor: "transparent", color: "rgba(255,255,255,0.45)",
                  fontSize: 12, fontWeight: 400, cursor: "pointer",
                }}
              >
                종료
              </button>
            </div>
          </div>
        </div>
      )}
      onClick={() => {/* noop — 오버레이 클릭 시 닫히지 않도록 */}}
    >
      {children}
    </Highlight>
  );
}
