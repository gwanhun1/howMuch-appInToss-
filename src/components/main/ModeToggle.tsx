import { Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { motion } from "framer-motion";
import type { RecordMode } from "../../types/record";

interface ModeToggleProps {
  currentMode: RecordMode;
  onModeChange: (mode: RecordMode) => void;
}

export function ModeToggle({ currentMode, onModeChange }: ModeToggleProps) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
      {(["paid", "received"] as RecordMode[]).map((mode) => {
        const isActive = currentMode === mode;
        return (
          <motion.button
            key={mode}
            onClick={() => onModeChange(mode)}
            aria-pressed={isActive}
            animate={{
              fontSize: isActive ? "24px" : "16px",
              color: isActive ? adaptive.blue600 : adaptive.grey400,
              fontWeight: isActive ? 700 : 400,
            }}
            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
            style={{
              padding: "4px 8px",
              border: "none",
              background: "none",
              cursor: "pointer",
              lineHeight: "36px",
              minHeight: "44px",
              borderBottom: isActive ? `2px solid ${adaptive.blue600}` : "2px solid transparent",
            }}
          >
            {mode === "paid" ? "보낸" : "받은"}
          </motion.button>
        );
      })}
      <Text typography="t5" fontWeight="bold" color={adaptive.grey900} style={{ lineHeight: "32px", marginLeft: 2 }}>
        마음을 확인해보세요
      </Text>
    </div>
  );
}
