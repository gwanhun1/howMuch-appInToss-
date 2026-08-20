import { useState, useMemo } from "react";
import { FixedBottomCTA, Spacing, TextField, Text, useToast } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { AppHeader } from "../components/common/AppHeader";
import { useRecordStore } from "../stores/useRecordStore";
import { MODE_LABELS } from "../constants/category";

interface Props {
  value: number;
  onSave: (val: number) => void;
  onBack: () => void;
}

const QUICK_AMOUNTS = [
  { label: "5만", value: 50000 },
  { label: "10만", value: 100000 },
  { label: "15만", value: 150000 },
  { label: "20만", value: 200000 },
  { label: "30만", value: 300000 },
  { label: "50만", value: 500000 },
];

export function AmountInputPage({ value, onSave, onBack }: Props) {
  const [amount, setAmount] = useState(value === 0 ? "" : value.toString());
  const { records, editingRecord, currentMode } = useRecordStore();
  const labels = MODE_LABELS[currentMode];
  const { openToast } = useToast();

  const categoryStats = useMemo(() => {
    if (!editingRecord?.type) return null;
    const sameTypeRecords = records
      .filter((r) => r.mode === currentMode && r.type === editingRecord.type && r.amount > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sameTypeRecords.length === 0) return null;

    const lastAmount = sameTypeRecords[0].amount;
    const freq = new Map<number, number>();
    for (const r of sameTypeRecords) freq.set(r.amount, (freq.get(r.amount) || 0) + 1);
    let modeAmount = lastAmount;
    let maxCount = 0;
    for (const [amt, count] of freq) {
      if (count > maxCount) { modeAmount = amt; maxCount = count; }
    }
    return { type: editingRecord.type, lastAmount, modeAmount, isSame: lastAmount === modeAmount };
  }, [records, editingRecord, currentMode]);

  const MAX_AMOUNT = 100000000;
  const MAX_AMOUNT_DIGITS = MAX_AMOUNT.toString().length;

  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length > 1 && val.startsWith("0")) val = val.replace(/^0+/, "");
    // 자릿수로 1차 컷 → Number 변환 전 오버플로우 방지
    if (val.length > MAX_AMOUNT_DIGITS) {
      val = MAX_AMOUNT.toString();
    } else if (val !== "") {
      // 길이가 같거나 짧으면 안전하게 Number 비교 가능
      const num = Number(val);
      if (Number.isFinite(num) && num > MAX_AMOUNT) val = MAX_AMOUNT.toString();
    }
    setAmount(val);
  };

  const handleQuickSelect = (val: number) => setAmount(val.toString());

  const handleSave = () => {
    const num = amount === "" ? 0 : Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      openToast("0원보다 큰 금액을 입력해주세요");
      return;
    }
    if (num > MAX_AMOUNT) {
      openToast(`${MAX_AMOUNT.toLocaleString()}원을 넘을 수 없어요`);
      return;
    }
    onSave(num);
  };

  return (
    <div style={{
      backgroundColor: adaptive.grey50, height: "100vh",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <AppHeader title={labels.amountInputTitle} onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
        <Spacing size={32} />
        <Text typography="t3" fontWeight="bold" color={adaptive.grey900}>
          {labels.amountInputQuestion}
        </Text>
        {categoryStats && (
          <div style={{ marginTop: 8 }}>
            <Text typography="t6" color={adaptive.blue600} fontWeight="medium">
              {labels.lastAmountPrefix} {categoryStats.type}에는{" "}
              <span style={{ fontWeight: "bold" }}>
                {(categoryStats.lastAmount / 10000).toLocaleString()}만원
              </span>
              {labels.lastAmountSuffix}
            </Text>
            {!categoryStats.isSame && (
              <Text typography="t7" color={adaptive.grey500} style={{ marginTop: 4 }}>
                {labels.modeAmountPrefix}{" "}
                {(categoryStats.modeAmount / 10000).toLocaleString()}만원이에요.
              </Text>
            )}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => handleQuickSelect(categoryStats.lastAmount)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 20,
                  border: `1px solid ${adaptive.blue200}`,
                  backgroundColor: adaptive.blue50,
                  color: adaptive.blue700,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                지난 {categoryStats.type}{" "}
                {categoryStats.lastAmount.toLocaleString()}원
              </button>
              {!categoryStats.isSame && (
                <button
                  type="button"
                  onClick={() => handleQuickSelect(categoryStats.modeAmount)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 20,
                    border: `1px solid ${adaptive.grey200}`,
                    backgroundColor: "#fff",
                    color: adaptive.grey700,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  자주 쓴 {categoryStats.modeAmount.toLocaleString()}원
                </button>
              )}
            </div>
          </div>
        )}
        <Spacing size={32} />
        <TextField.Clearable variant="line" label="금액" value={amount}
          onChange={handleChangeAmount} inputMode="numeric" placeholder="0" suffix="원" autoFocus />
        <Spacing size={40} />
        <Text typography="t7" color={adaptive.grey600} fontWeight="semibold"
          style={{ marginBottom: 12, display: "block" }}>
          간편하게 선택하기
        </Text>
        <div style={{
          margin: "0 -20px", padding: "4px 20px", display: "flex", gap: "10px",
          overflowX: "auto", WebkitOverflowScrolling: "touch",
          msOverflowStyle: "none", scrollbarWidth: "none",
        }} className="no-scrollbar">
          {QUICK_AMOUNTS.map((item) => {
            const isSelected = amount === item.value.toString();
            return (
              <button type="button" key={item.value} onClick={() => handleQuickSelect(item.value)} style={{
                flexShrink: 0, padding: "12px 24px", borderRadius: "24px",
                border: isSelected ? "none" : `1px solid ${adaptive.blue100}`,
                backgroundColor: isSelected ? adaptive.blue500 : adaptive.blue50,
                color: isSelected ? "#ffffff" : adaptive.blue700,
                fontSize: "15px", fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: isSelected ? "0 4px 12px rgba(49, 130, 246, 0.25)" : "none",
              }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
      <FixedBottomCTA onClick={handleSave}>확인</FixedBottomCTA>
    </div>
  );
}
