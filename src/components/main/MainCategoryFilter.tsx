import { RECORD_CATEGORIES, CATEGORY_THEMES } from "../../constants/category";
import type { RecordType } from "../../types/record";

interface MainCategoryFilterProps {
  filterType: RecordType | "전체";
  onFilterChange: (type: RecordType | "전체") => void;
}

export function MainCategoryFilter({ filterType, onFilterChange }: MainCategoryFilterProps) {
  const categories = [
    RECORD_CATEGORIES.ALL,
    RECORD_CATEGORIES.WEDDING,
    RECORD_CATEGORIES.FUNERAL,
    RECORD_CATEGORIES.DOL,
    RECORD_CATEGORIES.ALLOWANCE,
  ] as const;

  return (
    <div style={{
      display: "flex", gap: "4px", overflowX: "auto",
      msOverflowStyle: "none", scrollbarWidth: "none", padding: "0 20px",
    }} className="no-scrollbar">
      {categories.map((cat) => {
        const theme = CATEGORY_THEMES[cat];
        const isSelected = filterType === cat;
        return (
          <button key={cat} onClick={() => onFilterChange(cat)} style={{
            flexShrink: 0, padding: "6px 12px", borderRadius: "20px",
            border: isSelected ? "none" : "1px solid rgba(0, 0, 0, 0.08)",
            backgroundColor: isSelected ? theme.color : "#fff",
            color: isSelected ? "#fff" : "#333",
            fontSize: "14px", fontWeight: isSelected ? 700 : 500,
            cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
          }}>
            {theme.label}
          </button>
        );
      })}
    </div>
  );
}
