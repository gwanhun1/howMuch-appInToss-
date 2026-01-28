import { useState } from "react";
import { FixedBottomCTA, Spacing, TextField, Top } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { AppHeader } from "@/components/common/AppHeader";

interface Props {
  value: number;
  onSave: (val: number) => void;
  onBack: () => void;
  onHome: () => void;
}

export function AmountInputPage({ value, onSave, onBack, onHome }: Props) {
  // 초기값이 0이면 빈 문자열로 설정하여 placeholder가 보이게 함
  const [amount, setAmount] = useState(value === 0 ? "" : value.toString());

  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, "");

    // 0으로 시작하는 숫자 처리 (예: 05 -> 5)
    if (val.length > 1 && val.startsWith("0")) {
      val = val.replace(/^0+/, "");
    }

    setAmount(val);
  };

  const handleSave = () => {
    // 빈 문자열은 0으로 처리
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
      }}
    >
      <AppHeader title="" onBack={onBack} onClose={onHome} />
      <Spacing size={32} />
      <Top
        title={
          <Top.TitleParagraph color={adaptive.grey900}>
            보낸 돈을 입력해주세요
          </Top.TitleParagraph>
        }
      />
      <Spacing size={24} />
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
      <FixedBottomCTA onClick={handleSave}>확인</FixedBottomCTA>
    </div>
  );
}
