import { useState, useMemo } from "react";
import { Text, Skeleton, Badge, Tooltip } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import type { RecordMode } from "../../types/record";
import { useRecordStore } from "../../stores/useRecordStore";
import { CATEGORY_THEMES, RECORD_CATEGORIES } from "../../constants/category";

interface MainSummaryCardProps {
  totalAmount: number;
  isLoading: boolean;
  recordsCount: number;
}

export function MainSummaryCard({ totalAmount, isLoading, recordsCount }: MainSummaryCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { records, currentMode, setCurrentMode } = useRecordStore();

  const modeRecords = useMemo(
    () => records.filter((r) => r.mode === currentMode),
    [records, currentMode],
  );

  const breakdown = useMemo(() => {
    return modeRecords.reduce((acc, r) => {
      if (r.type) acc[r.type] = (acc[r.type] || 0) + r.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [modeRecords]);

  const categories = [
    { label: "축의금", key: RECORD_CATEGORIES.WEDDING },
    { label: "조의금", key: RECORD_CATEGORIES.FUNERAL },
    { label: "돌잔치", key: RECORD_CATEGORIES.DOL },
    { label: "용돈", key: RECORD_CATEGORIES.ALLOWANCE },
  ] as const;

  return (
    <div style={{ position: "relative", overflow: "visible" }}>
      {isOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 900 }}
          onClick={() => setIsOpen(false)} />
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{
            display: "inline-flex", backgroundColor: adaptive.greyOpacity50,
            borderRadius: "8px", padding: "2px",
          }}>
            {(["paid", "received"] as RecordMode[]).map((mode) => {
              const isActive = currentMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setCurrentMode(mode)}
                  style={{
                    padding: "3px 10px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: isActive ? adaptive.blue600 : "transparent",
                    color: isActive ? adaptive.grey50 : adaptive.grey400,
                    fontSize: "17px",
                    fontWeight: isActive ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    lineHeight: 1.3,
                  }}
                >
                  {mode === "paid" ? "보낸" : "받은"}
                </button>
              );
            })}
          </div>
          <Text typography="t5" fontWeight="bold" color={adaptive.grey900}>
            마음을 확인해보세요
          </Text>
        </div>
        {isLoading ? (
          <Skeleton.Item style={{ width: 80, height: 24, borderRadius: 12 }} />
        ) : (
          recordsCount > 0 && (
            <div style={{ position: "relative", zIndex: 1000 }}>
              <Tooltip
                message={
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", whiteSpace: "nowrap" }}>
                    {categories.map((cat) => {
                      const amount = breakdown[cat.key] || 0;
                      const theme = CATEGORY_THEMES[cat.key];
                      return (
                        <div key={cat.key} style={{
                          display: "flex", alignItems: "center", gap: "4px",
                          opacity: amount === 0 ? 0.4 : 1,
                        }}>
                          <div style={{
                            width: "6px", height: "6px", borderRadius: "50%",
                            backgroundColor: theme?.color || adaptive.grey400, flexShrink: 0,
                          }} />
                          <span style={{ whiteSpace: "nowrap", fontSize: "12px" }}>
                            {cat.label} {amount.toLocaleString()}원
                          </span>
                        </div>
                      );
                    })}
                  </div>
                }
                placement="bottom" clipToEnd="right" open={isOpen} size="small" style={{ zIndex: 9999 }}
              >
                <Badge color="blue" variant="fill" size="small" className="premium-amount-badge"
                  style={{
                    maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap", display: "inline-block", paddingRight: "8px", cursor: "pointer",
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
