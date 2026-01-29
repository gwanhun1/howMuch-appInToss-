import { Asset } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";

type IconName = Parameters<typeof Asset.Icon>[0]["name"];

interface ProfileIconPreviewProps {
  iconName: IconName;
  onReset: () => void;
}

export function ProfileIconPreview({
  iconName,
  onReset,
}: ProfileIconPreviewProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          marginBottom: 24,
        }}
      >
        <Asset.Icon
          name={iconName}
          frameShape={{ width: 150 }}
          style={{
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
        <div
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          style={{
            position: "absolute",
            bottom: 4,
            right: 4,
            backgroundColor: adaptive.grey50,
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
            cursor: "pointer",
            border: `1px solid ${adaptive.grey100}`,
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Asset.Icon
            name="icon-plus-mono"
            frameShape={Asset.frameShape.CleanW16}
            color={adaptive.grey600}
            style={{ transform: "rotate(45deg)", width: 24, height: 24 }}
          />
        </div>
      </div>
    </div>
  );
}
