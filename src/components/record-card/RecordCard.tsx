import { Asset, Spacing, Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { motion, useAnimation } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import type { MoneyRecord } from "../../types/record";
import { CATEGORY_THEMES, RECORD_CATEGORIES } from "../../constants/category";

type IconName = Parameters<typeof Asset.Icon>[0]["name"];

interface RecordCardProps {
  record: MoneyRecord;
  onClick: () => void;
  onToggleFavorite: (id: string) => void;
}

export function RecordCard({ record, onClick, onToggleFavorite }: RecordCardProps) {
  const controls = useAnimation();
  const [isClicking, setIsClicking] = useState(false);
  const lastClickTime = useRef(0);

  const handleTap = useCallback(async () => {
    const now = Date.now();
    if (now - lastClickTime.current < 300 || isClicking) return;
    lastClickTime.current = now;
    setIsClicking(true);
    await controls.start({ scale: 0.96, transition: { duration: 0.08 } });
    controls.start({ scale: 1, transition: { duration: 0.1 } });
    onClick();
    setTimeout(() => setIsClicking(false), 300);
  }, [controls, onClick, isClicking]);

  const todayStr = new Date().toISOString().split("T")[0];
  const isUpcoming = record.date && record.date >= todayStr;

  const getDdayText = () => {
    if (!record.date || !isUpcoming) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(record.date);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "D-Day";
    return `D-${diffDays}`;
  };
  const ddayText = getDdayText();

  const theme = CATEGORY_THEMES[record.type || "전체"];
  const cardBgColor = theme.lightColor;
  const borderColor = isUpcoming ? "rgba(0, 0, 0, 0.04)" : `${theme.color}40`;
  const shadow = isUpcoming ? `0 4px 12px ${theme.color}18` : "0 4px 12px rgba(0, 0, 0, 0.03)";
  const amountColor = adaptive.blue600;
  const badgeColor = theme.defaultBadgeColor;
  const badgeText = theme.badgeText;

  return (
    <motion.div
      onClick={handleTap}
      className={isUpcoming ? "upcoming-aura" : ""}
      animate={controls}
      initial={{ scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px 12px 20px",
        backgroundColor: cardBgColor,
        borderRadius: "24px",
        cursor: "pointer",
        border: `1px solid ${borderColor}`,
        position: "relative",
        boxShadow: shadow,
        height: "160px",
        boxSizing: "border-box",
        overflow: "visible",
        ...(isUpcoming ? { "--aura-color": `${theme.color}40` } as React.CSSProperties : {}),
      }}
    >
      {record.isFavorite && (
        <div
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(record.id); }}
          style={{ position: "absolute", top: "8px", left: "8px", cursor: "pointer", padding: "4px", zIndex: 1 }}
        >
          <Asset.Icon name="icon-star-blue" frameShape={Asset.frameShape.CleanW16} />
        </div>
      )}

      {ddayText && (
        <div style={{
          position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)",
          padding: "4px 10px", borderRadius: "10px", fontSize: "10px", fontWeight: "bold",
          backgroundColor: "#3182F6", color: "#fff", boxShadow: "0 2px 6px rgba(49, 130, 246, 0.3)", zIndex: 2,
        }}>
          {ddayText}
        </div>
      )}

      {record.type && (
        <div style={{
          position: "absolute", top: "8px", right: "8px", padding: "3px 6px", borderRadius: "10px",
          fontSize: "11px", fontWeight: "bold", backgroundColor: `${badgeColor}15`, color: badgeColor,
          border: `1px solid ${badgeColor}30`, maxWidth: "60px", overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap", backdropFilter: "blur(8px)",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
        }}>
          {badgeText}
        </div>
      )}

      <div style={{
        width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.5)",
        display: "flex", justifyContent: "center", alignItems: "center",
        filter: record.type === RECORD_CATEGORIES.FUNERAL ? "grayscale(1)" : "none",
        transition: "all 0.3s ease",
      }}>
        <Asset.Icon
          name={(record.profileIcon?.startsWith("icon-") ? record.profileIcon : "icon-face-cap") as IconName}
          frameShape={Asset.frameShape.CleanW60}
        />
      </div>

      <Spacing size={12} />
      <Text typography="t7" fontWeight="bold" color={adaptive.grey800}
        style={{ maxWidth: "90%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {record.name}
      </Text>
      {record.amount > 0 && (
        <Text typography="t7" color={amountColor} fontWeight="bold"
          style={{ marginTop: "4px", maxWidth: "90%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {record.amount.toLocaleString()}원
        </Text>
      )}
    </motion.div>
  );
}
