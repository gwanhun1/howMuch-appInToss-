import { Skeleton } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";

/** 리스트형(가로 행) 보기용 로딩 스켈레톤. RecordListItem 레이아웃과 정렬을 맞춘다. */
export function RecordListItemSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        backgroundColor: adaptive.background,
        borderRadius: "16px",
        border: `1px solid ${adaptive.grey100}`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          borderRadius: "50%",
          overflow: "hidden",
        }}
      >
        <Skeleton.Item style={{ width: "100%", height: "100%" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Skeleton.Item style={{ width: "40%", height: 16, borderRadius: 4 }} />
        <div style={{ height: 6 }} />
        <Skeleton.Item style={{ width: "25%", height: 14, borderRadius: 4 }} />
      </div>
      <Skeleton.Item style={{ width: 64, height: 16, borderRadius: 4 }} />
    </div>
  );
}
