import { adaptive } from "@toss/tds-colors";
import { motion } from "framer-motion";
import type { RecordType } from "../../types/record";
import {
  CATEGORY_THEMES,
  RECORD_CATEGORIES,
} from "../../constants/category";

interface EmptyStateProps {
  onQuickAdd?: (type: RecordType) => void;
}

const QUICK_PICKS: RecordType[] = [
  RECORD_CATEGORIES.WEDDING,
  RECORD_CATEGORIES.FUNERAL,
];

export function EmptyState({ onQuickAdd }: EmptyStateProps) {
  return (
    <div
      style={{
        gridColumn: "span 2",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
      }}
    >
      {QUICK_PICKS.map((type, i) => {
        const theme = CATEGORY_THEMES[type];
        return (
          <motion.button
            key={type}
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.15 }}
            onClick={() => onQuickAdd?.(type)}
            style={{
              height: 160,
              borderRadius: 24,
              border: `1.5px dashed ${theme.color}55`,
              backgroundColor: theme.lightColor,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 12px",
              boxSizing: "border-box",
              cursor: "pointer",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: theme.color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {theme.badgeText}
            </div>
            <div
              style={{
                fontSize: 13,
                color: adaptive.grey700,
                fontWeight: 600,
              }}
            >
              {theme.label} 기록하기
            </div>
            <div style={{ fontSize: 11, color: adaptive.grey400 }}>
              탭해서 바로 입력
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
