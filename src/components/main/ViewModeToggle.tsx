import { adaptive } from "@toss/tds-colors";
import { motion } from "framer-motion";

type ViewMode = "card" | "list";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const OPTIONS: { mode: ViewMode; label: string }[] = [
  { mode: "card", label: "카드형 보기" },
  { mode: "list", label: "리스트형 보기" },
];

/** 카드형(3열 그리드) ↔ 리스트형(세로 행) 보기 전환 토글 */
export function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: ViewModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="기록 보기 방식 전환"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        padding: 2,
        borderRadius: 10,
        backgroundColor: adaptive.grey100,
      }}
    >
      {OPTIONS.map(({ mode, label }) => {
        const isActive = viewMode === mode;
        return (
          <motion.button
            key={mode}
            type="button"
            onClick={() => onViewModeChange(mode)}
            aria-label={label}
            aria-pressed={isActive}
            animate={{
              backgroundColor: isActive ? adaptive.background : "transparent",
              color: isActive ? adaptive.blue600 : adaptive.grey400,
            }}
            transition={{ type: "tween", duration: 0.18, ease: "easeOut" }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 32,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              boxShadow: isActive
                ? "0 1px 3px rgba(0, 0, 0, 0.12)"
                : "none",
            }}
          >
            {mode === "card" ? <CardIcon /> : <ListIcon />}
          </motion.button>
        );
      })}
    </div>
  );
}

function CardIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" fill="currentColor" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" fill="currentColor" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" fill="currentColor" />
      <rect
        x="13.5"
        y="13.5"
        width="7.5"
        height="7.5"
        rx="2"
        fill="currentColor"
      />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="3" y="4.5" width="18" height="4" rx="2" fill="currentColor" />
      <rect x="3" y="15.5" width="18" height="4" rx="2" fill="currentColor" />
    </svg>
  );
}
