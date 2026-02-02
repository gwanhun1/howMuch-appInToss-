import { Asset, Spacing, Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { motion } from "framer-motion";
import type { Friend } from "../types/friend";

type IconName = Parameters<typeof Asset.Icon>[0]["name"];

interface FriendCardProps {
  friend: Friend;
  onClick: () => void;
  onToggleFavorite: (id: string) => void;
}

import { CATEGORY_THEMES, FRIEND_CATEGORIES } from "../constants/category";

export function FriendCard({
  friend,
  onClick,
  onToggleFavorite,
}: FriendCardProps) {
  // 날짜 기반 미래 일정 여부 확인 (오늘 포함)
  const todayStr = new Date().toISOString().split("T")[0];
  const isUpcoming = friend.date && friend.date >= todayStr;

  // 카테고리 테마 정보 가져오기
  const theme = CATEGORY_THEMES[friend.type || "전체"];

  // 배경색 로직 (미래 일정은 블루 틴트, 나머지는 카테고리별 파스텔 틴트)
  const cardBgColor = isUpcoming ? "#F2F8FF" : theme.lightColor;

  // 테두리 및 그림자 (다시 깔끔하게 복구)
  const borderColor = isUpcoming
    ? "rgba(49, 130, 246, 0.15)"
    : "rgba(0, 0, 0, 0.04)";
  const shadow = isUpcoming
    ? "0 4px 12px rgba(49, 130, 246, 0.1)"
    : "0 4px 12px rgba(0, 0, 0, 0.03)";

  const amountColor = adaptive.blue600;
  const badgeColor = theme.defaultBadgeColor;
  const badgeText = theme.badgeText;

  return (
    <motion.div
      onClick={onClick}
      className={isUpcoming ? "upcoming-aura" : ""}
      whileTap={{ scale: 0.96 }}
      whileHover={{
        y: -5,
        boxShadow: isUpcoming
          ? "0 8px 20px rgba(49, 130, 246, 0.15)"
          : "0 8px 20px rgba(0, 0, 0, 0.06)",
      }}
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
        minHeight: "156px",
      }}
    >
      {/* 즐겨찾기 별 */}
      {friend.isFavorite && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(friend.id);
          }}
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            cursor: "pointer",
            padding: "4px",
            zIndex: 1,
          }}
        >
          <Asset.Icon
            name="icon-star-blue"
            frameShape={Asset.frameShape.CleanW16}
          />
        </div>
      )}

      {/* 구분 배지 */}
      {friend.type && (
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            padding: "3px 7px",
            borderRadius: "8px",
            fontSize: "11px",
            fontWeight: "bold",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            color: badgeColor,
            border: `1px solid rgba(0, 0, 0, 0.02)`,
          }}
        >
          {badgeText}
        </div>
      )}

      {/* 아이콘 컨테이너 */}
      <div
        style={{
          width: "68px",
          height: "68px",
          borderRadius: "50%",
          backgroundColor: isUpcoming
            ? "rgba(49, 130, 246, 0.08)"
            : "rgba(255, 255, 255, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          filter:
            friend.type === FRIEND_CATEGORIES.FUNERAL ? "grayscale(1)" : "none",
          transition: "all 0.3s ease",
          marginTop: isUpcoming ? "6px" : "0",
        }}
      >
        <Asset.Icon
          name={
            (friend.profileIcon?.startsWith("icon-")
              ? friend.profileIcon
              : "icon-face-cap") as IconName
          }
          frameShape={Asset.frameShape.CleanW60}
        />
      </div>

      <Spacing size={12} />
      <Text typography="t7" fontWeight="bold" color={adaptive.grey800}>
        {friend.name}
      </Text>
      {friend.amount > 0 && (
        <Text
          typography="t7"
          color={amountColor}
          fontWeight="bold"
          style={{ marginTop: "4px" }}
        >
          {friend.amount.toLocaleString()}원
        </Text>
      )}
    </motion.div>
  );
}
