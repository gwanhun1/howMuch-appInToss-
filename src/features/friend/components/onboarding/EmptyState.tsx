import { Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { motion } from "framer-motion";

/**
 * 빈 리스트일 때 빈 카드 슬롯 2개를 보여줌
 * 점선 테두리 + 안내 문구로 채워질 자리임을 암시
 */
export function EmptyState() {
  const placeholders = [
    "누구에게 얼마를\n주고받았나요?",
    "기록하면\n한눈에 볼 수 있어요",
  ];

  return (
    <div
      style={{
        gridColumn: "span 2",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
      }}
    >
      {placeholders.map((text, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 + i * 0.15 }}
          style={{
            height: 160,
            borderRadius: 24,
            border: `1.5px dashed ${adaptive.grey200}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 12px",
            boxSizing: "border-box",
          }}
        >
          <Text
            typography="t7"
            color={adaptive.grey400}
            style={{ textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.5 }}
          >
            {text}
          </Text>
        </motion.div>
      ))}
    </div>
  );
}
