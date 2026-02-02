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
        backgroundColor: adaptive.blue50,
        borderRadius: "24px",
        border: `2px dashed ${adaptive.blue200}`,
        minHeight: "156px", // FriendCard와 높이 통일
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
        <Asset.Icon
          name="icon-box-cat-grey-blue-eye"
          frameShape={Asset.frameShape.CleanW32}
          style={{ marginBottom: "8px" }}
        />
        <Text
          typography="t7"
          fontWeight="semibold"
          color={adaptive.blue600}
          style={{ textAlign: "center" }}
        >
          광고 타임
        </Text>
      </div>
    </div>
  );
}
