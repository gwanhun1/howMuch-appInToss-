import { useState, useMemo } from "react";
import { Skeleton, Badge, Tooltip } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import type { MoneyRecord } from "../../types/record";
import { CATEGORY_THEMES, RECORD_CATEGORIES } from "../../constants/category";

const CATEGORIES = [
  { label: "축의금", key: RECORD_CATEGORIES.WEDDING },
  { label: "조의금", key: RECORD_CATEGORIES.FUNERAL },
  { label: "돌잔치", key: RECORD_CATEGORIES.DOL },
  { label: "용돈", key: RECORD_CATEGORIES.ALLOWANCE },
] as const;

/** 경조사비는 만원 단위가 기본 → 천원 단위는 버리고 "N만원"으로 표시. */
function formatManWon(amount: number): string {
  if (amount < 10000) return `${amount.toLocaleString()}원`;
  const man = Math.floor(amount / 10000);
  return `${man.toLocaleString()}만원`;
}

interface TotalAmountBadgeProps {
  totalAmount: number;
  isLoading: boolean;
  recordsCount: number;
  modeRecords: MoneyRecord[];
}

export function TotalAmountBadge({
  totalAmount,
  isLoading,
  recordsCount,
  modeRecords,
}: TotalAmountBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const breakdown = useMemo(() => {
    return modeRecords.reduce(
      (acc, r) => {
        if (r.type) acc[r.type] = (acc[r.type] || 0) + r.amount;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [modeRecords]);

  if (isLoading) {
    return (
      <Skeleton.Item style={{ width: 80, height: 24, borderRadius: 12 }} />
    );
  }

  if (recordsCount === 0) return null;

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 150,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
      <div style={{ position: "relative", zIndex: 160 }}>
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
              {CATEGORIES.map((cat) => {
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
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: theme?.color || adaptive.grey400,
                        flexShrink: 0,
                      }}
                    />
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
          style={{ zIndex: 170 }}
        >
          <Badge
            color="blue"
            variant="fill"
            size="small"
            className="premium-amount-badge"
            style={{
              maxWidth: "100px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
              paddingRight: "8px",
              cursor: "pointer",
            }}
            onClick={() => setIsOpen(!isOpen)}
          >
            총 {formatManWon(totalAmount)}
          </Badge>
        </Tooltip>
      </div>
    </>
  );
}
