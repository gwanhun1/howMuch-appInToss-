import { Asset, Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";

interface Props {
  title?: string;
  onBack?: () => void;
}

export function AppHeader({ title = "얼마냈지요", onBack }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        height: "56px",
        minHeight: "56px",
        flexShrink: 0,
        backgroundColor: adaptive.grey50,
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
        <Asset.Image
          frameShape={Asset.frameShape.CleanW24}
          src="https://static.toss.im/appsintoss/17227/e6c265d0-b517-44d1-8d5e-66e394617883.png"
          aria-hidden={true}
        />
        <Text
          color={adaptive.grey900}
          typography="t5"
          fontWeight="bold"
          style={{ marginLeft: "8px", minWidth: 0, overflowWrap: "anywhere" }}
        >
          {title}
        </Text>
      </div>
      {onBack && !("ReactNativeWebView" in window) && (
        <button
          type="button"
          onClick={onBack}
          style={{ border: 0, background: "none", color: adaptive.grey700,
            font: "inherit", padding: "12px 8px", cursor: "pointer", flexShrink: 0 }}
        >
          입력 취소
        </button>
      )}
    </div>
  );
}
