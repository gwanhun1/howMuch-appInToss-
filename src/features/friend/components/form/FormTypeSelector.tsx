import { ListRow } from "@toss/tds-mobile";
import type { FriendType } from "../../types/friend";
import { FRIEND_CATEGORIES, CATEGORY_THEMES } from "../../constants/category";

interface FormTypeSelectorProps {
  value: FriendType | null;
  onChange: (type: FriendType) => void;
}

export function FormTypeSelector({ value, onChange }: FormTypeSelectorProps) {
  const categories = [
    FRIEND_CATEGORIES.WEDDING,
    FRIEND_CATEGORIES.FUNERAL,
    FRIEND_CATEGORIES.DOL,
    FRIEND_CATEGORIES.ALLOWANCE,
  ] as const;

  return (
    <div style={{ padding: "16px 20px" }}>
      <ListRow.Texts type="1RowTypeB" top="어떤 상황인가요?" />
      <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
        {categories.map((cat) => {
          const theme = CATEGORY_THEMES[cat];
          const isSelected = value === cat;

          return (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                border: isSelected ? "none" : "1px solid rgba(0, 0, 0, 0.08)",
                backgroundColor: isSelected ? theme.color : "#fff",
                color: isSelected ? "#fff" : "#333",
                fontSize: "14px",
                fontWeight: isSelected ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {theme.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
