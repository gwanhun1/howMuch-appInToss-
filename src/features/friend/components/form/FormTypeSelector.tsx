import { Button, ListRow } from "@toss/tds-mobile";
import type { FriendType } from "../../types/friend";

interface FormTypeSelectorProps {
  value: FriendType | null;
  onChange: (type: FriendType) => void;
}

export function FormTypeSelector({ value, onChange }: FormTypeSelectorProps) {
  return (
    <ListRow
      contents={<ListRow.Texts type="1RowTypeB" top="어떤 상황인가요?" />}
      right={
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            variant={value === "축의금" ? "fill" : "weak"}
            size="small"
            onClick={() => onChange("축의금")}
          >
            축의금
          </Button>
          <Button
            variant={value === "조의금" ? "fill" : "weak"}
            size="small"
            onClick={() => onChange("조의금")}
          >
            조의금
          </Button>
        </div>
      }
    />
  );
}
