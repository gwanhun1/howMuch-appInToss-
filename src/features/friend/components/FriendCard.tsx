import { Asset, Spacing, Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import type { Friend } from "../types/friend";

type IconName = Parameters<typeof Asset.Icon>[0]["name"];

interface FriendCardProps {
  friend: Friend;
  onClick: () => void;
}

export function FriendCard({ friend, onClick }: FriendCardProps) {
  const isCondolence = friend.type === "조의금";
  const isCgratulatory = friend.type === "축의금";

  const cardBgColor = isCgratulatory
    ? "#f0f7ff" // 토스 blue50 느낌의 연한 하늘색
    : isCondolence
      ? adaptive.grey100 // 토스 연한 그레이
      : "#ffffff";

  const borderColor = isCgratulatory
    ? "rgba(49, 130, 246, 0.15)"
    : isCondolence
      ? adaptive.grey200
      : adaptive.grey200;

  const badgeBgColor = isCgratulatory
    ? "rgba(0, 100, 255, 0.1)"
    : "rgba(107, 107, 107, 0.1)";

  const badgeColor = isCgratulatory ? adaptive.blue600 : adaptive.grey700;

  const badgeText = isCgratulatory ? "축" : "조";

  const amountColor = isCgratulatory ? adaptive.blue700 : adaptive.grey800;

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 8px",
        backgroundColor: cardBgColor,
        borderRadius: "20px",
        cursor: "pointer",
        border: `1px solid ${borderColor}`,
        position: "relative",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
        overflow: "hidden",
        minHeight: "148px",
      }}
    >
      {/* 구분 배지 */}
      {friend.type && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "4px 8px",
            borderRadius: "8px",
            fontSize: "10px",
            fontWeight: "bold",
            backgroundColor: badgeBgColor,
            color: badgeColor,
          }}
        >
          {badgeText}
        </div>
      )}

      <div
        style={{
          filter: isCondolence ? "grayscale(0.9)" : "none",
          transition: "transform 0.2s",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
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
      <Text typography="t7" fontWeight="semibold" color={adaptive.grey800}>
        {friend.name}
      </Text>
      {friend.amount > 0 && (
        <Text typography="t7" color={amountColor} style={{ marginTop: "2px" }}>
          {friend.amount.toLocaleString()}원
        </Text>
      )}
    </div>
  );
}
