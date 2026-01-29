import { Asset, Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";

interface AddFriendCardProps {
  onClick: () => void;
}

export function AddFriendCard({ onClick }: AddFriendCardProps) {
  return (
    <div
      className="add-card-pulse"
      onClick={onClick}
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        cursor: "pointer",
        border: `1px solid ${adaptive.grey200}`,
        minHeight: "148px",
      }}
    >
      <Asset.Icon
        name="icon-plus-circle-mono"
        frameShape={Asset.frameShape.CleanW24}
        color={adaptive.grey600}
        style={{ width: 40, height: 40 }}
      />
      <Text
        typography="t7"
        fontWeight="regular"
        style={{ color: adaptive.grey700 }}
      >
        추가
      </Text>
    </div>
  );
}
