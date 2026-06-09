"use client";

import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { type SortState, useTableSort } from "@/shared/hooks/useTableSort";
import { cn } from "@/shared/lib/utils/cn";

export interface DataTableColumn<T, K extends string = string> {
  /** Stable id for the column (used as the React key). */
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** When set (and a matching comparator exists), the header becomes a sort toggle. */
  sortKey?: K;
  align?: "left" | "center" | "right";
  /** Right-aligns and applies `tabular-nums font-medium` to header + cell (for score/count/rank columns). */
  numeric?: boolean;
  /** Applied to the body `<td>`. */
  className?: string;
  /** Applied to the header `<th>`. */
  headerClassName?: string;
}

export interface DataTableProps<T, K extends string = string> {
  columns: DataTableColumn<T, K>[];
  data: T[];
  getRowId: (row: T) => string;
  comparators?: Partial<Record<K, (a: T, b: T) => number>>;
  defaultSort?: SortState<K>;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  isLoading?: boolean;
  skeletonRows?: number;
  /** Rendered (spanning all columns) when there is no data and not loading. */
  empty?: ReactNode;
  /** Applied to the bordered card wrapper. */
  className?: string;
}

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

export function DataTable<T, K extends string = string>({
  columns,
  data,
  getRowId,
  comparators,
  defaultSort,
  onRowClick,
  rowClassName,
  isLoading = false,
  skeletonRows = 6,
  empty,
  className,
}: DataTableProps<T, K>) {
  const { sortedData, sortState, toggleSort } = useTableSort<T, K>({
    data,
    comparators: comparators ?? {},
    defaultSort,
  });

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-transparent bg-card shadow-sm", className)}>
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => {
              const sortable = !!col.sortKey && !!comparators?.[col.sortKey];
              const active = sortable && sortState.key === col.sortKey;
              return (
                <TableHead
                  key={col.id}
                  className={cn(
                    "font-semibold text-xs",
                    col.numeric ? "text-right" : col.align && alignClass[col.align],
                    sortable && "cursor-pointer select-none transition-colors hover:text-foreground",
                    col.headerClassName,
                  )}
                  onClick={sortable ? () => toggleSort(col.sortKey as K) : undefined}>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1",
                      col.align === "center" && "justify-center",
                      (col.align === "right" || col.numeric) && "justify-end",
                    )}>
                    {col.header}
                    {sortable &&
                      (active ? (
                        sortState.direction === "asc" ? (
                          <ChevronUp className="size-3.5" />
                        ) : (
                          <ChevronDown className="size-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3.5 opacity-50" />
                      ))}
                  </span>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`} className="hover:bg-transparent">
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    className={cn(col.numeric ? "text-right" : col.align && alignClass[col.align], col.className)}>
                    <Skeleton className={cn("h-4 w-full max-w-[120px]", col.numeric && "ml-auto")} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : sortedData.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-32 whitespace-normal p-0 text-center">
                {empty ?? (
                  <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
                    데이터가 없습니다.
                  </div>
                )}
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((row) => (
              <TableRow
                key={getRowId(row)}
                className={cn(onRowClick && "cursor-pointer", rowClassName?.(row))}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? "button" : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    className={cn(
                      col.numeric ? "text-right font-medium tabular-nums" : col.align && alignClass[col.align],
                      col.className,
                    )}>
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
