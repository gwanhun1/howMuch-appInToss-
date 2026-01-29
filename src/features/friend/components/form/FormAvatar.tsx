import { Asset } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import type { FriendType } from "../../types/friend";

type IconName = Parameters<typeof Asset.Icon>[0]["name"];

interface FormAvatarProps {
  iconName: string;
  type: FriendType | null;
  onClick: () => void;
}

export function FormAvatar({ iconName, type, onClick }: FormAvatarProps) {
  const displayIcon = iconName.startsWith("icon-") ? iconName : "icon-face-cap";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        onClick={onClick}
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          cursor: "pointer",
          filter: type === "조의금" ? "grayscale(1)" : "none",
        }}
      >
        <Asset.Icon
          name={displayIcon as IconName}
          frameShape={Asset.frameShape.CleanW100}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            backgroundColor: "#ffffff",
            borderRadius: "50%",
            width: "28px",
            height: "28px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <Asset.Icon
            name="icon-plus-mono"
            frameShape={Asset.frameShape.CleanW16}
            color={adaptive.grey500}
            style={{ width: 30, height: 30 }}
          />
        </div>
      </div>
    </div>
  );
}
