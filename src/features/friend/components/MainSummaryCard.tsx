import { Text, Skeleton, Badge } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";

interface MainSummaryCardProps {
  totalAmount: number;
  isLoading: boolean;
  friendsCount: number;
}

export function MainSummaryCard({
  totalAmount,
  isLoading,
  friendsCount,
}: MainSummaryCardProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
      }}
    >
      <Text typography="t4" fontWeight="bold" color={adaptive.grey900}>
        오간 마음을 확인해보세요
      </Text>
      {isLoading ? (
        <Skeleton.Item style={{ width: 80, height: 24, borderRadius: 12 }} />
      ) : (
        friendsCount > 0 && (
          <Badge
            color="blue"
            variant="fill"
            size="small"
            className="premium-amount-badge"
            style={{
              maxWidth: "120px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
              flexShrink: 0,
            }}
          >
            총 {totalAmount.toLocaleString()}원
          </Badge>
        )
      )}
    </div>
  );
}
