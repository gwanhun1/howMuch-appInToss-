import { Spacing, Skeleton } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";

export function RecordCardSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px 12px 20px",
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        border: `1px solid ${adaptive.grey200}`,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
        height: "160px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          backgroundColor: adaptive.grey100,
          overflow: "hidden",
        }}
      >
        <Skeleton.Item style={{ width: "100%", height: "100%" }} />
      </div>
      <Spacing size={12} />
      <Skeleton.Item style={{ width: "50%", height: 16, borderRadius: 4 }} />
      <Spacing size={4} />
      <Skeleton.Item style={{ width: "40%", height: 14, borderRadius: 4 }} />
    </div>
  );
}
