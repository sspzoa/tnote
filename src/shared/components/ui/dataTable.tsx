import type { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  actionColumn?: (item: T) => ReactNode;
}

export function DataTable<T>({ data, columns, keyExtractor, onRowClick, actionColumn }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
      <table className="w-full">
        <thead className="border-line-divider border-b bg-components-fill-standard-secondary">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary ${col.width || ""}`}>
                <span className="relative">{col.header}</span>
              </th>
            ))}
            {actionColumn && (
              <th className="w-24 px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary" />
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-line-divider">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              className={`transition-colors hover:bg-core-accent-translucent/50 ${onRowClick ? "cursor-pointer" : ""}`}>
              {columns.map((col) => (
                <td key={col.key} className="px-spacing-500 py-spacing-400 text-body text-content-standard-primary">
                  {col.render(item)}
                </td>
              ))}
              {actionColumn && <td className="relative px-spacing-500 py-spacing-400">{actionColumn(item)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
