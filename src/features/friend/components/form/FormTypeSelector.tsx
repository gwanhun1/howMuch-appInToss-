import { Button, ListRow } from "@toss/tds-mobile";
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
  ] as const;

  return (
    <ListRow
      contents={<ListRow.Texts type="1RowTypeB" top="어떤 상황인가요?" />}
      right={
        <div style={{ display: "flex", gap: "8px" }}>
          {categories.map((cat) => {
            const theme = CATEGORY_THEMES[cat];
            const isSelected = value === cat;

            return (
              <Button
                key={cat}
                variant={isSelected ? "fill" : "weak"}
                size="small"
                onClick={() => onChange(cat)}
                style={
                  isSelected && cat !== FRIEND_CATEGORIES.FUNERAL // 조의금은 기본 weak/fill 테마 유지
                    ? { backgroundColor: theme.color, border: "none" }
                    : {}
                }
              >
                {theme.label}
              </Button>
            );
          })}
        </div>
      }
    />
  );
}
