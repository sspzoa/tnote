import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils/cn";

function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("animate-pulse rounded-md bg-accent", className)} {...props} />;
}

interface SkeletonSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const spinnerSizeClasses = {
  sm: "size-5",
  md: "size-6",
  lg: "size-8",
};

export function SkeletonSpinner({ className = "min-h-[50vh]", size = "lg" }: SkeletonSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)} role="status" aria-live="polite">
      <div
        className={cn(
          spinnerSizeClasses[size],
          "animate-spin rounded-full border-2 border-primary border-t-transparent",
        )}
      />
    </div>
  );
}

export type SkeletonColumnDef =
  | string // 단순 width class (예: "w-16")
  | { width: string; rounded?: boolean } // width + rounded badge 스타일
  | { width: string; stacked: [string, string] } // 두 줄 스택 (예: 이름 + 부제목)
  | { width: string; badges: string[] } // 여러 뱃지
  | { width: string; buttons: string[] } // 여러 버튼
  | "action"; // 마지막 액션 컬럼 (드롭다운 메뉴)

interface SkeletonTableProps {
  rows?: number;
  columns: SkeletonColumnDef[];
}

export function SkeletonTable({ rows = 5, columns }: SkeletonTableProps) {
  const renderHeaderCell = (col: SkeletonColumnDef, index: number) => {
    if (col === "action") {
      return <th key={index} className="w-24 whitespace-nowrap px-5 py-4" />;
    }
    const width = typeof col === "string" ? col : col.width;
    return (
      <th key={index} className="whitespace-nowrap px-5 py-4 text-left">
        <Skeleton className={cn("h-6", width)} />
      </th>
    );
  };

  const renderBodyCell = (col: SkeletonColumnDef, index: number) => {
    if (col === "action") {
      return (
        <td key={index} className="whitespace-nowrap px-5 py-4">
          <Skeleton className="ml-auto h-9 w-11 rounded-sm" />
        </td>
      );
    }

    if (typeof col === "string") {
      return (
        <td key={index} className="whitespace-nowrap px-5 py-4">
          <Skeleton className={cn("h-6", col)} />
        </td>
      );
    }

    if ("rounded" in col && col.rounded) {
      return (
        <td key={index} className="whitespace-nowrap px-5 py-4">
          <Skeleton className={cn("h-7 rounded-sm", col.width)} />
        </td>
      );
    }

    if ("stacked" in col) {
      return (
        <td key={index} className="whitespace-nowrap px-5 py-4">
          <div className="flex flex-col gap-1">
            <Skeleton className={cn("h-6", col.stacked[0])} />
            <Skeleton className={cn("h-5", col.stacked[1])} />
          </div>
        </td>
      );
    }

    if ("badges" in col) {
      return (
        <td key={index} className="whitespace-nowrap px-5 py-4">
          <div className="flex gap-1">
            {col.badges.map((w, i) => (
              <Skeleton key={i} className={cn("h-6 rounded-sm", w)} />
            ))}
          </div>
        </td>
      );
    }

    if ("buttons" in col) {
      return (
        <td key={index} className="whitespace-nowrap px-5 py-4">
          <div className="flex gap-2">
            {col.buttons.map((w, i) => (
              <Skeleton key={i} className={cn("h-9 rounded-md", w)} />
            ))}
          </div>
        </td>
      );
    }

    return (
      <td key={index} className="whitespace-nowrap px-5 py-4">
        <Skeleton className={cn("h-6", col.width)} />
      </td>
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full rounded-xl">
        <thead className="bg-muted">
          <tr>{columns.map(renderHeaderCell)}</tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex} className="border-t border-border">
              {columns.map(renderBodyCell)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { Skeleton };
