import { useState, useMemo } from "react";
import { Text, Skeleton, Badge, Tooltip } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { useFriendStore } from "../../stores/useFriendStore";
import { CATEGORY_THEMES, FRIEND_CATEGORIES } from "../../constants/category";

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
  const [isOpen, setIsOpen] = useState(false);
  const { friends } = useFriendStore();

  const breakdown = useMemo(() => {
    return friends.reduce(
      (acc, f) => {
        if (f.type) {
          acc[f.type] = (acc[f.type] || 0) + f.amount;
        }
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [friends]);

  const categories = [
    { label: "축의금", key: FRIEND_CATEGORIES.WEDDING },
    { label: "조의금", key: FRIEND_CATEGORIES.FUNERAL },
    { label: "돌잔치", key: FRIEND_CATEGORIES.DOL },
    { label: "용돈", key: FRIEND_CATEGORIES.ALLOWANCE },
  ] as const;

  return (
    <div style={{ position: "relative", overflow: "visible" }}>
      {/* 바깥 영역 클릭 시 닫기 위한 오버레이 */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 900,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

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
            <div style={{ position: "relative", zIndex: 1000 }}>
              <Tooltip
                message={
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {categories.map((cat) => {
                      const amount = breakdown[cat.key] || 0;
                      const theme = CATEGORY_THEMES[cat.key];
                      return (
                        <div
                          key={cat.key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            opacity: amount === 0 ? 0.4 : 1,
                          }}
                        >
                          <div style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: theme?.color || adaptive.grey400,
                            flexShrink: 0,
                          }} />
                          <span style={{ whiteSpace: "nowrap", fontSize: "12px" }}>
                            {cat.label} {amount.toLocaleString()}원
                          </span>
                        </div>
                      );
                    })}
                  </div>
                }
                placement="bottom"
                clipToEnd="right"
                open={isOpen}
                size="small"
                style={{ zIndex: 9999 }}
              >
                <Badge
                  color="blue"
                  variant="fill"
                  size="small"
                  className="premium-amount-badge"
                  style={{
                    maxWidth: "140px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    paddingRight: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  총 {totalAmount.toLocaleString()}원
                </Badge>
              </Tooltip>
            </div>
          )
        )}
      </div>
    </div>
  );
}
