import { useState, useRef } from "react";
import { Asset, Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { motion } from "framer-motion";

interface AddRecordCardProps {
  onClick: () => void;
}

export function AddRecordCard({ onClick }: AddRecordCardProps) {
  const [isClicking, setIsClicking] = useState(false);
  const lastClickTime = useRef(0);

  const handleClick = () => {
    const now = Date.now();
    // 300ms 디바운스
    if (now - lastClickTime.current < 300 || isClicking) return;
    
    lastClickTime.current = now;
    setIsClicking(true);
    onClick();
    
    // 300ms 후 클릭 가능 상태로 복구
    setTimeout(() => setIsClicking(false), 300);
  };

  return (
    <motion.div
      className="add-card-pulse"
      onClick={handleClick}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "rgba(49, 130, 246, 0.04)",
        borderRadius: "24px",
        cursor: "pointer",
        border: `1px solid rgba(49, 130, 246, 0.1)`,
        height: "160px",
        boxSizing: "border-box",
        boxShadow: "0 4px 12px rgba(49, 130, 246, 0.05)",
      }}
    >
      <Asset.Icon
        name="icon-plus-circle-mono"
        frameShape={Asset.frameShape.CleanW24}
        color={adaptive.blue600}
        style={{ width: 40, height: 40 }}
      />
      <Text
        typography="t7"
        fontWeight="bold"
        style={{ color: adaptive.blue600, marginTop: "8px" }}
      >
        추가
      </Text>
    </motion.div>
  );
}
