import { useState, useMemo } from "react";
import { FixedBottomCTA, Spacing, TextField, Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { AppHeader } from "../../../components/common/AppHeader";
import { useFriendStore } from "../stores/useFriendStore";

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
  const { friends, editingFriend } = useFriendStore();

  // 최근 해당 카테고리(축의금, 조의금 등)의 평균 금액 계산
  const categoryStats = useMemo(() => {
    if (!editingFriend?.type) return null;

    const sameTypeFriends = friends.filter(
      (f) => f.type === editingFriend.type,
    );
    if (sameTypeFriends.length === 0) return null;

    const total = sameTypeFriends.reduce((acc, f) => acc + f.amount, 0);
    const average = Math.round(total / sameTypeFriends.length / 10000) * 10000; // 만원 단위 반올림

    return {
      type: editingFriend.type,
      average,
    };
  }, [friends, editingFriend]);

  // 금액 상한선: 1억원 (100,000,000)
  const MAX_AMOUNT = 100000000;

  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length > 1 && val.startsWith("0")) {
      val = val.replace(/^0+/, "");
    }
    // 상한선 초과 시 최대값으로 제한
    if (val !== "" && Number(val) > MAX_AMOUNT) {
      val = MAX_AMOUNT.toString();
    }
    setAmount(val);
  };

  const handleQuickSelect = (val: number) => {
    setAmount(val.toString());
  };

  const handleSave = () => {
    const num = amount === "" ? 0 : Number(amount);
    if (!isNaN(num)) {
      onSave(num);
    }
  };

  return (
    <div
      style={{
        backgroundColor: adaptive.grey50,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <AppHeader title="보낸 돈 입력" onBack={onBack} />

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
        <Spacing size={32} />

        {/* 상단 타이틀 영역 */}
        <Text typography="t3" fontWeight="bold" color={adaptive.grey900}>
          이번에 얼마를 전했나요?
        </Text>

        {categoryStats && (
          <div style={{ marginTop: 8 }}>
            <Text typography="t6" color={adaptive.blue600} fontWeight="medium">
              최근 {categoryStats.type}에는 주로{" "}
              <span style={{ fontWeight: "bold" }}>
                {(categoryStats.average / 10000).toLocaleString()}만원
              </span>
              을 보내셨네요.
            </Text>
          </div>
        )}

        <Spacing size={32} />

        {/* 입력 영역 */}
        <TextField.Clearable
          variant="line"
          label="금액"
          value={amount}
          onChange={handleChangeAmount}
          inputMode="numeric"
          placeholder="0"
          suffix="원"
          autoFocus
        />

        <Spacing size={40} />

        {/* 퀵 선택 영역 */}
        <Text
          typography="t7"
          color={adaptive.grey600}
          fontWeight="semibold"
          style={{ marginBottom: 12, display: "block" }}
        >
          간편하게 선택하기
        </Text>

        <div
          style={{
            margin: "0 -20px", // 부모 padding 무시
            padding: "4px 20px", // 내부 여백으로 아이템 정렬 맞춤
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
          className="no-scrollbar"
        >
          {QUICK_AMOUNTS.map((item) => {
            const isSelected = amount === item.value.toString();
            return (
              <button
                key={item.value}
                onClick={() => handleQuickSelect(item.value)}
                style={{
                  flexShrink: 0,
                  padding: "12px 24px",
                  borderRadius: "24px",
                  border: isSelected ? "none" : `1px solid ${adaptive.blue100}`,
                  backgroundColor: isSelected
                    ? adaptive.blue500
                    : adaptive.blue50,
                  color: isSelected ? "#ffffff" : adaptive.blue700,
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: isSelected
                    ? "0 4px 12px rgba(49, 130, 246, 0.25)"
                    : "none",
                }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.96)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
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
