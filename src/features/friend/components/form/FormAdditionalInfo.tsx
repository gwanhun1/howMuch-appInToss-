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

export function FormAdditionalInfo({
  expanded,
  relation,
  date,
  onRelationChange,
  onDateChange,
}: FormAdditionalInfoProps) {
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
          label="날짜"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
        <Spacing size={20} />
      </div>
    </div>
  );
}
