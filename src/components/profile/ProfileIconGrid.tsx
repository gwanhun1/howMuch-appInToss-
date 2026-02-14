import { Asset } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";

type IconName = Parameters<typeof Asset.Icon>[0]["name"];

interface ProfileIconGridProps {
  icons: Array<{ code: IconName }>;
  selectedIcon: IconName;
  onSelect: (icon: IconName) => void;
}

export function ProfileIconGrid({
  icons,
  selectedIcon,
  onSelect,
}: ProfileIconGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 8,
        padding: "0 16px 16px",
      }}
    >
      {icons.map((iconItem) => (
        <div
          key={iconItem.code}
          onClick={() => onSelect(iconItem.code)}
          style={{
            aspectRatio: "1 / 1",
            borderRadius: "16px",
            backgroundColor:
              selectedIcon === iconItem.code
                ? adaptive.blue50
                : adaptive.grey50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            border:
              selectedIcon === iconItem.code
                ? `2px solid ${adaptive.blue500}`
                : `1px solid transparent`,
            transition: "all 0.2s ease",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Asset.Icon
            name={iconItem.code}
            frameShape={Asset.frameShape.CleanW60}
            style={{
              transform:
                selectedIcon === iconItem.code ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.2s",
            }}
          />
          {selectedIcon === iconItem.code && (
            <div
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                backgroundColor: adaptive.blue500,
                borderRadius: "50%",
                width: 14,
                height: 14,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 3,
                  borderBottom: "2px solid white",
                  borderLeft: "2px solid white",
                  transform: "rotate(-45deg) translate(1px, -1px)",
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
