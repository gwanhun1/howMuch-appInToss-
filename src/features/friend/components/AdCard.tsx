import { Asset, Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";

export function AdCard() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 8px",
        backgroundColor: "transparent",
        borderRadius: "16px",
        border: `2px dashed ${adaptive.blue100}`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          typography="t7"
          fontWeight="semibold"
          color={adaptive.blue200}
          style={{ textAlign: "center" }}
        >
          광고 타임
        </Text>
        <Asset.Icon
          name="icon-box-cat-grey-blue-eye"
          frameShape={Asset.frameShape.CleanW16}
        />
      </div>
    </div>
  );
}
