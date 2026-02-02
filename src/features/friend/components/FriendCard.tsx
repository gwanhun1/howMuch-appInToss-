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

export function FriendCard({
  friend,
  onClick,
  onToggleFavorite,
}: FriendCardProps) {
  const isCondolence = friend.type === "조의금";
  const isCgratulatory = friend.type === "축의금";
  const isDol = friend.type === "돌잔치";

  // 날짜 기반 미래 일정 여부 확인 (오늘 포함)
  const todayStr = new Date().toISOString().split("T")[0];
  const isUpcoming = friend.date && friend.date >= todayStr;

  // 상단 포인트 라인 컬러
  const topBarColor = isCgratulatory
    ? "#FF4B78"
    : isCondolence
      ? adaptive.grey400
      : isDol
        ? "#FFB900"
        : "transparent";

  // 배경색 로직 (미래 일정은 블루 틴트, 나머지는 카테고리별 파스텔 틴트)
  const cardBgColor = isUpcoming
    ? "#F2F8FF" // 연한 토스 블루
    : isCgratulatory
      ? "#FFF2F6" // 연한 핑크
      : isCondolence
        ? "#F8F9FA" // 연한 그레이
        : isDol
          ? "#FFFBEB" // 연한 노랑
          : "#FFFFFF";

  // 테두리 및 그림자 (다시 깔끔하게 복구)
  const borderColor = isUpcoming
    ? "rgba(49, 130, 246, 0.15)"
    : "rgba(0, 0, 0, 0.04)";
  const shadow = isUpcoming
    ? "0 4px 12px rgba(49, 130, 246, 0.1)"
    : "0 4px 12px rgba(0, 0, 0, 0.03)";

  const amountColor = adaptive.blue600;
  const badgeColor =
    topBarColor !== "transparent" ? topBarColor : adaptive.grey600;
  const badgeText = isCgratulatory ? "축" : isCondolence ? "조" : "돌";

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
          filter: isCondolence ? "grayscale(1)" : "none",
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
