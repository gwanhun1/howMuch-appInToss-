import { Button, Spacing, Text, TextField } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";

interface FormAdditionalInfoProps {
  expanded: boolean;
  relation: string;
  date: string;
  onRelationChange: (relation: string) => void;
  onDateChange: (date: string) => void;
}

const RELATION_OPTIONS = ["친구", "가족", "지인", "직장", "동료"];

// 날짜 유효 범위: 오늘 기준 ±10년
const getDateBounds = () => {
  const today = new Date();
  const minDate = new Date(today);
  minDate.setFullYear(today.getFullYear() - 10);
  const maxDate = new Date(today);
  maxDate.setFullYear(today.getFullYear() + 10);
  
  return {
    min: minDate.toISOString().split("T")[0],
    max: maxDate.toISOString().split("T")[0],
  };
};

export function FormAdditionalInfo({
  expanded,
  relation,
  date,
  onRelationChange,
  onDateChange,
}: FormAdditionalInfoProps) {
  const dateBounds = getDateBounds();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 범위 내 날짜만 허용
    if (value >= dateBounds.min && value <= dateBounds.max) {
      onDateChange(value);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: expanded ? "1fr" : "0fr",
        transition: "grid-template-rows 0.3s ease-out",
        overflow: "hidden",
      }}
    >
      <div style={{ minHeight: 0 }}>
        <div
          style={{
            padding: "0 20px",
            opacity: expanded ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
          }}
        >
          <Spacing size={12} />
          <Text typography="t7" color={adaptive.grey600}>
            관계
          </Text>
          <Spacing size={8} />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {RELATION_OPTIONS.map((rel) => (
              <Button
                key={rel}
                variant={relation === rel ? "fill" : "weak"}
                size="small"
                onClick={() => onRelationChange(rel)}
              >
                {rel}
              </Button>
            ))}
          </div>
          <Spacing size={16} />
        </div>
        <TextField
          variant="line"
          label="날짜 (선택)"
          labelOption="sustain"
          type="date"
          value={date}
          onChange={handleDateChange}
          min={dateBounds.min}
          max={dateBounds.max}
        />
        {!date && (
          <div style={{ padding: "6px 20px 0" }}>
            <Text typography="t7" color={adaptive.grey500}>
              선택하지 않으면 날짜 없이 저장돼요
            </Text>
          </div>
        )}
        <Spacing size={20} />
      </div>
    </div>
  );
}
