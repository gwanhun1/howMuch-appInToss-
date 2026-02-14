import { useState } from "react";
import { Menu } from "@toss/tds-mobile";
import type { RecordType } from "../../types/record";
import { CATEGORY_THEMES, RECORD_CATEGORIES } from "../../constants/category";

const FILTER_CATEGORIES = [
  RECORD_CATEGORIES.ALL,
  RECORD_CATEGORIES.WEDDING,
  RECORD_CATEGORIES.FUNERAL,
  RECORD_CATEGORIES.DOL,
  RECORD_CATEGORIES.ALLOWANCE,
] as const;

interface CategoryFilterBadgeProps {
  filterType: RecordType | "전체";
  onFilterChange: (type: RecordType | "전체") => void;
}

export function CategoryFilterBadge({ filterType, onFilterChange }: CategoryFilterBadgeProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Menu.Trigger
      open={menuOpen}
      onOpen={() => setMenuOpen(true)}
      onClose={() => setMenuOpen(false)}
      placement="bottom-start"
      dropdown={
        <Menu.Dropdown>
          {FILTER_CATEGORIES.map((cat) => (
            <Menu.DropdownCheckItem
              key={cat}
              checked={filterType === cat}
              onClick={() => {
                onFilterChange(cat);
                setMenuOpen(false);
              }}
            >
              {CATEGORY_THEMES[cat].label}
            </Menu.DropdownCheckItem>
          ))}
        </Menu.Dropdown>
      }
    >
      <div style={{
        padding: "4px 12px",
        borderRadius: "16px",
        backgroundColor: CATEGORY_THEMES[filterType].color,
        color: "#fff",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        whiteSpace: "nowrap",
      }}>
        {CATEGORY_THEMES[filterType].label} ▾
      </div>
    </Menu.Trigger>
  );
}
