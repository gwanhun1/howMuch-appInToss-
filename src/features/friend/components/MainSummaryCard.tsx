import { useState, useMemo } from "react";
import { Text, Skeleton, Badge } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { useFriendStore } from "../stores/useFriendStore";

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
    { label: "축의금", key: "축의금" },
    { label: "조의금", key: "조의금" },
    { label: "돌잔치", key: "돌잔치" },
  ] as const;

  return (
    <div style={{ position: "relative" }}>
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
            <div style={{ position: "relative" }}>
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
                  position: "relative",
                  zIndex: 901,
                }}
                onClick={() => setIsOpen(!isOpen)}
              >
                총 {totalAmount.toLocaleString()}원
              </Badge>

              {/* 커스텀 팝오버 영역 */}
              {isOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 12px)",
                    right: 0,
                    width: "180px",
                    backgroundColor: adaptive.blue50,
                    borderRadius: "16px",
                    padding: "16px",
                    border: `1px solid ${adaptive.blue200}`,
                    boxShadow: "0 10px 30px rgba(49, 130, 246, 0.12)",
                    zIndex: 1000,
                    animation:
                      "popoverAppear 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  }}
                >
                  {/* 말풍선 꼬리 */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "24px",
                      width: "10px",
                      height: "10px",
                      backgroundColor: adaptive.blue50,
                      borderLeft: `1px solid ${adaptive.blue200}`,
                      borderTop: `1px solid ${adaptive.blue200}`,
                      transform: "rotate(45deg)",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {categories.map((cat) => (
                      <div
                        key={cat.key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text typography="t7" color={adaptive.grey700}>
                          {cat.label}
                        </Text>
                        <Text
                          typography="t7"
                          fontWeight="bold"
                          color={adaptive.blue700}
                        >
                          {(breakdown[cat.key] || 0).toLocaleString()}원
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>

      <style>{`
        @keyframes popoverAppear {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
