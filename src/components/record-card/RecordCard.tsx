import { Asset, Spacing, Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { memo, useCallback, useMemo, useRef } from "react";
import type { MoneyRecord } from "../../types/record";
import { CATEGORY_THEMES, RECORD_CATEGORIES } from "../../constants/category";
import { getRecordDday } from "../../utils/recordDisplay";

type IconName = Parameters<typeof Asset.Icon>[0]["name"];

interface RecordCardProps {
  record: MoneyRecord;
  onClick: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

function RecordCardComponent({
  record,
  onClick,
  onToggleFavorite,
}: RecordCardProps) {
  const lastClickTime = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // CSS transition으로 scale 처리 (framer-motion useAnimation 제거)
  const handlePointerDown = useCallback(() => {
    if (cardRef.current) cardRef.current.style.transform = "scale(0.96)";
  }, []);

  const handlePointerUp = useCallback(() => {
    if (cardRef.current) cardRef.current.style.transform = "scale(1)";
  }, []);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastClickTime.current < 300) return;
    lastClickTime.current = now;
    onClick(record.id);
  }, [onClick, record.id]);

  const { isUpcoming, ddayText } = useMemo(
    () => getRecordDday(record.date),
    [record.date],
  );

  const theme = CATEGORY_THEMES[record.type || "전체"];
  const cardBgColor = theme.lightColor;
  const borderColor = isUpcoming ? "rgba(0, 0, 0, 0.04)" : `${theme.color}40`;
  const shadow = isUpcoming ? `0 4px 12px ${theme.color}18` : "0 4px 12px rgba(0, 0, 0, 0.03)";
  const amountColor = adaptive.blue600;
  const badgeColor = theme.defaultBadgeColor;
  const badgeText = theme.badgeText;

  return (
    <div
      ref={cardRef}
      onClick={handleTap}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={isUpcoming ? "upcoming-aura" : ""}
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
        transform: "scale(1)",
        transition: "transform 0.12s ease-out",
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
    </div>
  );
}

export const RecordCard = memo(RecordCardComponent);
