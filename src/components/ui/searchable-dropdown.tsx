"use client";

import * as React from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface SearchableDropdownItem {
  value: string;
  label: string;
  searchText?: string;
  group?: string;
}

interface SearchableDropdownProps {
  items: SearchableDropdownItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  /** عرض النتائج مُجمّعة حسب group */
  grouped?: boolean;
}

/** تطبيع النص للبحث العربي */
function normalizeForSearch(s: string): string {
  return (s || "")
    .normalize("NFC")
    .replace(/\//g, "")
    .trim();
}

/** فحص مطابقة البحث - يدعم كلمات متعددة (الكل يجب أن يطابق) */
function matchesSearch(item: SearchableDropdownItem, searchWords: string[]): boolean {
  if (searchWords.length === 0) return true;
  const text = normalizeForSearch(item.searchText || item.label);
  return searchWords.every((w) => text.includes(normalizeForSearch(w)));
}

export function SearchableDropdown({
  items,
  value,
  onChange,
  placeholder = "اختر...",
  searchPlaceholder = "ابحث بالاسم العربي (رياضيات، فيزياء، النسبة...)",
  emptyMessage = "لا توجد نتائج",
  loading = false,
  disabled = false,
  className,
  grouped = true,
}: SearchableDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedItem = React.useMemo(() => items.find((i) => i.value === value), [items, value]);

  const filteredAndGrouped = React.useMemo(() => {
    const q = search.trim().replace(/\//g, "").trim();
    const words = q ? q.split(/\s+/).filter(Boolean) : [];
    const filtered = words.length > 0 ? items.filter((i) => matchesSearch(i, words)) : items;

    if (!grouped) return { "": filtered };

    const groups: Record<string, SearchableDropdownItem[]> = {};
    for (const item of filtered) {
      const g = item.group || "أخرى";
      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    }
    return groups;
  }, [items, search, grouped]);

  const groupOrder = ["صفحات عامة", "المراحل", "الرياضيات", "الفيزياء", "الكيمياء", "الأحياء", "لغتي", "اللغة العربية", "العلوم", "الدراسات الاجتماعية", "أخرى"];

  const sortedGroups = React.useMemo(() => {
    const keys = Object.keys(filteredAndGrouped).filter((k) => (filteredAndGrouped[k]?.length ?? 0) > 0);
    return keys.sort((a, b) => {
      const ai = groupOrder.indexOf(a);
      const bi = groupOrder.indexOf(b);
      if (ai >= 0 && bi >= 0) return ai - bi;
      if (ai >= 0) return -1;
      if (bi >= 0) return 1;
      return a.localeCompare(b);
    });
  }, [filteredAndGrouped]);

  React.useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const totalFiltered = Object.values(filteredAndGrouped).reduce((a, arr) => a + arr.length, 0);

  return (
    <div className={cn("relative", className)} dir="rtl">
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        className="w-full justify-between font-normal h-11 text-right"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate">
          {selectedItem?.label ?? (value || placeholder)}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border bg-popover shadow-lg overflow-hidden"
            style={{ minWidth: "var(--radix-popover-trigger-width, 100%)" }}
          >
            <div className="border-b p-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex h-9 w-full rounded-md border bg-transparent pr-9 pl-3 py-1 text-sm outline-none placeholder:text-muted-foreground"
                  autoComplete="off"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto p-1">
              {loading ? (
                <p className="py-6 text-center text-sm text-muted-foreground">جاري تحميل القائمة...</p>
              ) : items.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">لا توجد صفحات</p>
              ) : totalFiltered === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
              ) : (
                <>
                  {sortedGroups.map((groupKey) => {
                    const groupItems = filteredAndGrouped[groupKey];
                    if (!groupItems?.length) return null;
                    return (
                      <div key={groupKey || "_"} className="mb-2">
                        {groupKey && <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{groupKey}</p>}
                        {groupItems.map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            className={cn(
                              "flex w-full cursor-pointer items-center rounded-sm px-2 py-2 text-right text-sm outline-none transition-colors",
                              value === item.value
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-accent/50"
                            )}
                            onClick={() => handleSelect(item.value)}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
