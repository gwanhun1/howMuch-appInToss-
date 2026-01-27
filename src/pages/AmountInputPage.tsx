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
    setAmount(e.target.value);
  };

  return (
    <>
      <AppHeader title="금액 입력" onBack={onBack} onClose={onHome} />
      <Spacing size={12} />
      <Top
        title={
          <Top.TitleParagraph size={22} color={adaptive.grey900}>
            보낸 돈을 입력해주세요
          </Top.TitleParagraph>
        }
      />
      <div style={{ padding: "20px" }}>
        <TextField.Clearable
          variant="line"
          label=""
          value={amount}
          onChange={handleChangeAmount}
          inputMode="numeric"
          placeholder="금액"
        />
      </div>
      <FixedBottomCTA onClick={() => onSave(Number(amount))}>
        확인
      </FixedBottomCTA>
    </>
  );
}
