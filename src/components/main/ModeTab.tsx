import { adaptive } from "@toss/tds-colors";
import type { RecordMode } from "../../types/record";
import { MODE_LABELS } from "../../constants/category";

interface ModeTabProps {
  currentMode: RecordMode;
  onModeChange: (mode: RecordMode) => void;
}

export function ModeTab({ currentMode, onModeChange }: ModeTabProps) {
  const modes: RecordMode[] = ["paid", "received"];

  return (
    <div style={{
      display: "flex", gap: "4px", padding: "0 20px",
      backgroundColor: adaptive.grey50,
    }}>
      {modes.map((mode) => {
        const isSelected = currentMode === mode;
        return (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: "12px",
              border: "none",
              backgroundColor: isSelected ? "#fff" : "transparent",
              color: isSelected ? adaptive.blue600 : adaptive.grey500,
              fontSize: "15px",
              fontWeight: isSelected ? 700 : 500,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: isSelected ? "0 2px 8px rgba(0, 0, 0, 0.06)" : "none",
            }}
          >
            {MODE_LABELS[mode].tab}
          </button>
        );
      })}
    </div>
  );
}
