import { Asset, Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { memo, useCallback, useMemo, useRef } from "react";
import type { MoneyRecord } from "../../types/record";
import { CATEGORY_THEMES, RECORD_CATEGORIES } from "../../constants/category";
import { getRecordDday } from "../../utils/recordDisplay";

type IconName = Parameters<typeof Asset.Icon>[0]["name"];

interface RecordListItemProps {
  record: MoneyRecord;
  onClick: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

function RecordListItemComponent({
  record,
  onClick,
  onToggleFavorite,
}: RecordListItemProps) {
  const lastClickTime = useRef(0);
  const rowRef = useRef<HTMLDivElement>(null);

  // RecordCard와 동일한 터치 피드백(scale) + 더블탭 방지 패턴
  const handlePointerDown = useCallback(() => {
    if (rowRef.current) rowRef.current.style.transform = "scale(0.98)";
  }, []);

  const handlePointerUp = useCallback(() => {
    if (rowRef.current) rowRef.current.style.transform = "scale(1)";
  }, []);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastClickTime.current < 300) return;
    lastClickTime.current = now;
    onClick(record.id);
  }, [onClick, record.id]);

  const handleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleFavorite(record.id);
    },
    [onToggleFavorite, record.id],
  );

  const { isUpcoming, ddayText } = useMemo(
    () => getRecordDday(record.date),
    [record.date],
  );

  const theme = CATEGORY_THEMES[record.type || "전체"];
  const badgeColor = theme.defaultBadgeColor;
  const borderColor = isUpcoming ? `${theme.color}40` : adaptive.grey100;
  const shadow = isUpcoming
    ? `0 2px 8px ${theme.color}18`
    : "0 1px 4px rgba(0, 0, 0, 0.03)";
  const profileIconName = (
    record.profileIcon?.startsWith("icon-")
      ? record.profileIcon
      : "icon-face-cap"
  ) as IconName;

  return (
    <div
      ref={rowRef}
      onClick={handleTap}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        backgroundColor: adaptive.background,
        borderRadius: "16px",
        border: `1px solid ${borderColor}`,
        boxShadow: shadow,
        cursor: "pointer",
        boxSizing: "border-box",
        transform: "scale(1)",
        transition: "transform 0.12s ease-out",
      }}
    >
      {/* 프로필 아이콘 */}
      <div
        style={{
          flexShrink: 0,
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: theme.lightColor,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          filter:
            record.type === RECORD_CATEGORIES.FUNERAL ? "grayscale(1)" : "none",
        }}
      >
        <Asset.Icon name={profileIconName} frameShape={Asset.frameShape.CleanW40} />
      </div>

      {/* 이름 + 카테고리 배지 + D-day */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {record.isFavorite && (
            <div
              onClick={handleFavorite}
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <Asset.Icon
                name="icon-star-blue"
                frameShape={Asset.frameShape.CleanW16}
              />
            </div>
          )}
          <Text
            typography="t6"
            fontWeight="bold"
            color={adaptive.grey800}
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {record.name}
          </Text>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "4px",
          }}
        >
          {record.type && (
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: "bold",
                backgroundColor: `${badgeColor}15`,
                color: badgeColor,
                border: `1px solid ${badgeColor}30`,
                whiteSpace: "nowrap",
              }}
            >
              {record.type}
            </span>
          )}
          {ddayText && (
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: "bold",
                backgroundColor: "#3182F6",
                color: "#fff",
                whiteSpace: "nowrap",
              }}
            >
              {ddayText}
            </span>
          )}
          {!record.type && !ddayText && record.date && (
            <Text typography="t7" color={adaptive.grey400}>
              {record.date}
            </Text>
          )}
        </div>
      </div>

      {/* 금액 (우측 정렬) */}
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        {record.amount > 0 ? (
          <Text typography="t6" fontWeight="bold" color={adaptive.blue600}>
            {record.amount.toLocaleString()}원
          </Text>
        ) : (
          <Text typography="t6" color={adaptive.grey400}>
            -
          </Text>
        )}
      </div>
    </div>
  );
}

export const RecordListItem = memo(RecordListItemComponent);
