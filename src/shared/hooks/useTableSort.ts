import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc" | null;

export interface SortState<K extends string> {
  key: K | null;
  direction: SortDirection;
}

type CompareFn<T> = (a: T, b: T) => number;

export interface UseTableSortOptions<T, K extends string> {
  data: T[];
  comparators: Partial<Record<K, CompareFn<T>>>;
  defaultSort?: SortState<K>;
}

export interface UseTableSortReturn<T, K extends string> {
  sortedData: T[];
  sortState: SortState<K>;
  toggleSort: (key: K) => void;
}

export const useTableSort = <T, K extends string>({
  data,
  comparators,
  defaultSort,
}: UseTableSortOptions<T, K>): UseTableSortReturn<T, K> => {
  const [sortState, setSortState] = useState<SortState<K>>(defaultSort ?? { key: null, direction: null });

  const toggleSort = (key: K) => {
    setSortState((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: null };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortState.key || !sortState.direction) return data;

    const comparator = comparators[sortState.key];
    if (!comparator) return data;

    const multiplier = sortState.direction === "asc" ? 1 : -1;
    return [...data].sort((a, b) => comparator(a, b) * multiplier);
  }, [data, sortState, comparators]);

  return { sortedData, sortState, toggleSort };
};
