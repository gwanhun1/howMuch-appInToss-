import { FRIEND_CATEGORIES, CATEGORY_THEMES } from "../../constants/category";
import type { FriendType } from "../../types/friend";

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
        gap: "4px",
        overflowX: "auto",
        msOverflowStyle: "none",
        scrollbarWidth: "none",
        padding: "0 20px",
      }}
      className="no-scrollbar"
    >
      {categories.map((cat) => {
        const theme = CATEGORY_THEMES[cat];
        const isSelected = filterType === cat;

        return (
          <button
            key={cat}
            onClick={() => onFilterChange(cat)}
            style={{
              flexShrink: 0,
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
  );
}
