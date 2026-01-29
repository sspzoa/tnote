import type { SortDirection } from "@/shared/hooks/useTableSort";

interface SortableHeaderProps<K extends string = string> {
  label: string;
  sortKey: K;
  currentSortKey: K | null;
  currentDirection: SortDirection;
  onSort: (key: K) => void;
  className?: string;
}

const SortIcon = ({ direction }: { direction: SortDirection }) => (
  <svg
    className="ml-spacing-100 inline-block h-3.5 w-3.5 text-content-standard-tertiary"
    viewBox="0 0 14 14"
    fill="none">
    <path
      d="M7 2.5L10 6H4L7 2.5Z"
      fill={direction === "asc" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1"
    />
    <path
      d="M7 11.5L4 8H10L7 11.5Z"
      fill={direction === "desc" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1"
    />
  </svg>
);

export const SortableHeader = <K extends string = string>({
  label,
  sortKey,
  currentSortKey,
  currentDirection,
  onSort,
  className = "",
}: SortableHeaderProps<K>) => {
  const isActive = currentSortKey === sortKey;

  return (
    <th
      className={`cursor-pointer select-none whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover ${className}`}
      onClick={() => onSort(sortKey)}>
      <span className="inline-flex items-center">
        {label}
        <SortIcon direction={isActive ? currentDirection : null} />
      </span>
    </th>
  );
};
