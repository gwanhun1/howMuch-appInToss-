import { Badge } from "@toss/tds-mobile";
import { FRIEND_CATEGORIES, CATEGORY_THEMES } from "../constants/category";
import type { FriendType } from "../types/friend";

interface MainCategoryFilterProps {
  filterType: FriendType | "전체";
  onFilterChange: (type: FriendType | "전체") => void;
}

export function MainCategoryFilter({
  filterType,
  onFilterChange,
}: MainCategoryFilterProps) {
  const categories = [
    FRIEND_CATEGORIES.ALL,
    FRIEND_CATEGORIES.WEDDING,
    FRIEND_CATEGORIES.FUNERAL,
    FRIEND_CATEGORIES.DOL,
    FRIEND_CATEGORIES.ALLOWANCE,
  ] as const;

  return (
    <div
      style={{
        display: "flex",
        gap: "6px",
        padding: "0 20px",
        overflowX: "auto",
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      {categories.map((cat) => {
        const theme = CATEGORY_THEMES[cat];
        const isSelected = filterType === cat;

        return (
          <Badge
            key={cat}
            color={isSelected ? "blue" : "elephant"}
            variant={isSelected ? "fill" : "weak"}
            size="small"
            style={{
              cursor: "pointer",
              transition: "all 0.2s",
              padding: "6px 12px",
              borderRadius: "10px",
              flexShrink: 0,
              ...(isSelected &&
              cat !== FRIEND_CATEGORIES.ALL &&
              cat !== FRIEND_CATEGORIES.FUNERAL
                ? { backgroundColor: theme.color, border: "none" }
                : {}),
            }}
            onClick={() => onFilterChange(cat)}
          >
            {theme.label}
          </Badge>
        );
      })}
    </div>
  );
}
