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
  const [amount, setAmount] = useState(value.toString());

  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setAmount(val);
  };

  const handleSave = () => {
    const num = Number(amount);
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
      <div style={{ flex: 1, padding: "0 24px" }}>
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
      </div>
      <FixedBottomCTA onClick={handleSave}>확인</FixedBottomCTA>
    </div>
  );
}
