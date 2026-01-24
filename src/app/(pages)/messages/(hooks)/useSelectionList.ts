"use client";

import { useCallback, useMemo, useState } from "react";

export interface SelectableItem {
  id: string;
  name?: string;
}

interface UseSelectionListOptions<T extends SelectableItem> {
  items: T[];
  getSearchableText?: (item: T) => string;
}

interface UseSelectionListReturn<T extends SelectableItem> {
  selectedIds: Set<string>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredItems: T[];
  allSelected: boolean;
  someSelected: boolean;
  handleToggle: (id: string) => void;
  handleSelectAll: () => void;
  resetSelection: () => void;
  selectedCount: number;
}

export const useSelectionList = <T extends SelectableItem>({
  items,
  getSearchableText = (item) => item.name || "",
}: UseSelectionListOptions<T>): UseSelectionListReturn<T> => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    const filtered = searchQuery.trim()
      ? items.filter((item) => getSearchableText(item).toLowerCase().includes(searchQuery.toLowerCase()))
      : [...items];
    return filtered.sort((a, b) => (a.name || "").localeCompare(b.name || "", "ko"));
  }, [items, searchQuery, getSearchableText]);

  const allSelected = useMemo(() => {
    if (filteredItems.length === 0) return false;
    return filteredItems.every((item) => selectedIds.has(item.id));
  }, [filteredItems, selectedIds]);

  const someSelected = useMemo(() => {
    return filteredItems.some((item) => selectedIds.has(item.id)) && !allSelected;
  }, [filteredItems, selectedIds, allSelected]);

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        for (const item of filteredItems) {
          next.delete(item.id);
        }
      } else {
        for (const item of filteredItems) {
          next.add(item.id);
        }
      }
      return next;
    });
  }, [filteredItems, allSelected]);

  const resetSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSearchQuery("");
  }, []);

  return {
    selectedIds,
    searchQuery,
    setSearchQuery,
    filteredItems,
    allSelected,
    someSelected,
    handleToggle,
    handleSelectAll,
    resetSelection,
    selectedCount: selectedIds.size,
  };
};
