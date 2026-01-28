import { Asset, IconButton, Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";

interface Props {
  title?: string;
  onBack?: () => void;
}

export function AppHeader({ title = "얼마냈지", onBack }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        height: "56px",
        backgroundColor: adaptive.grey50,
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {onBack && (
          <IconButton
            onClick={onBack}
            aria-label="뒤로 가기"
            name="icon-arrow-back-ios-mono"
          />
        )}
        <Asset.Image
          frameShape={Asset.frameShape.CleanW24}
          src="https://static.toss.im/appsintoss/17227/e6c265d0-b517-44d1-8d5e-66e394617883.png"
          aria-hidden={true}
        />
        <Text
          color={adaptive.grey900}
          typography="t5"
          fontWeight="bold"
          style={{ marginLeft: "8px" }}
        >
          {title}
        </Text>
      </div>
    </div>
  );
}
