interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-radius-200 bg-components-fill-standard-secondary ${className}`} />;
}

export function SkeletonText({ className = "" }: SkeletonProps) {
  return <Skeleton className={`h-4 ${className}`} />;
}

export function SkeletonButton({ className = "" }: SkeletonProps) {
  return <Skeleton className={`h-10 rounded-radius-300 ${className}`} />;
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return <Skeleton className={`rounded-radius-500 ${className}`} />;
}

export function SkeletonAvatar({ className = "" }: SkeletonProps) {
  return <Skeleton className={`size-10 rounded-full ${className}`} />;
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className="overflow-hidden rounded-radius-500 border border-line-outline bg-components-fill-standard-primary">
      <div className="border-line-divider border-b bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
        <div className="flex gap-spacing-400">
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-line-divider">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-spacing-400 px-spacing-500 py-spacing-400">
            {[...Array(columns)].map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface SkeletonListProps {
  rows?: number;
  showAvatar?: boolean;
}

export function SkeletonList({ rows = 5, showAvatar = false }: SkeletonListProps) {
  return (
    <div className="space-y-spacing-300">
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-spacing-400 rounded-radius-500 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
          {showAvatar && <SkeletonAvatar />}
          <div className="flex-1 space-y-spacing-200">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20 rounded-radius-300" />
        </div>
      ))}
    </div>
  );
}

interface SkeletonGridProps {
  items?: number;
  columns?: 2 | 3 | 4;
}

export function SkeletonGrid({ items = 6, columns = 3 }: SkeletonGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <div className={`grid gap-spacing-400 ${gridCols[columns]}`}>
      {[...Array(items)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-spacing-300 rounded-radius-500 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonHeader() {
  return (
    <div className="mb-spacing-700 space-y-spacing-300">
      <Skeleton className="h-3 w-32" />
      <div className="flex items-end justify-between">
        <div className="space-y-spacing-200">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-28 rounded-radius-300" />
      </div>
    </div>
  );
}

export function SkeletonFilterBar() {
  return (
    <div className="flex items-center gap-spacing-300">
      <Skeleton className="h-10 flex-1 rounded-radius-300" />
      <Skeleton className="h-10 w-32 rounded-radius-300" />
      <Skeleton className="h-10 w-32 rounded-radius-300" />
    </div>
  );
}

interface HistoryListSkeletonProps {
  count?: number;
}

export function HistoryListSkeleton({ count = 4 }: HistoryListSkeletonProps) {
  return (
    <div className="space-y-spacing-400">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500">
          <div className="flex items-center justify-between gap-spacing-300">
            <div className="flex min-w-0 flex-1 items-center gap-spacing-300">
              <Skeleton className="h-7 w-16 shrink-0 rounded-radius-200" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex shrink-0 items-center gap-spacing-300">
              <div className="flex shrink-0 flex-col items-end gap-spacing-50">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-8 w-8 rounded-radius-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface TagListSkeletonProps {
  count?: number;
}

export function TagListSkeleton({ count = 4 }: TagListSkeletonProps) {
  return (
    <div className="space-y-spacing-200">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-radius-300 border border-line-outline bg-components-fill-standard-primary p-spacing-300">
          <div className="flex items-center gap-spacing-300">
            <Skeleton className="h-7 w-20 rounded-radius-200" />
          </div>
          <div className="flex gap-spacing-200">
            <Skeleton className="h-[38px] w-14 rounded-radius-300" />
            <Skeleton className="h-[38px] w-14 rounded-radius-300" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface ConsultationListSkeletonProps {
  count?: number;
}

export function ConsultationListSkeleton({ count = 4 }: ConsultationListSkeletonProps) {
  return (
    <div className="divide-y divide-line-divider overflow-hidden rounded-radius-300 border border-line-outline">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="px-spacing-500 py-spacing-400">
          <div className="mb-spacing-100 flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-24 rounded-radius-200" />
          </div>
          <div className="flex items-center gap-spacing-200">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StudentInfoSkeleton() {
  return (
    <div className="flex flex-col gap-spacing-600">
      <section>
        <Skeleton className="mb-spacing-300 h-6 w-20" />
        <div className="grid grid-cols-2 gap-spacing-300 rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col gap-spacing-50">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <Skeleton className="mb-spacing-300 h-6 w-28" />
        <div className="divide-y divide-line-divider overflow-hidden rounded-radius-400 border border-line-outline">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
              <div className="flex flex-col gap-spacing-50">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="h-6 w-20 rounded-radius-200" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <Skeleton className="mb-spacing-300 h-6 w-28" />
        <div className="divide-y divide-line-divider overflow-hidden rounded-radius-400 border border-line-outline">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
              <div className="flex flex-col gap-spacing-50">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex items-center gap-spacing-200">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16 rounded-radius-200" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Skeleton className="mb-spacing-300 h-6 w-28" />
        <div className="divide-y divide-line-divider overflow-hidden rounded-radius-400 border border-line-outline">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
              <div className="flex flex-col gap-spacing-50">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex items-center gap-spacing-200">
                <Skeleton className="h-6 w-14 rounded-radius-200" />
                <Skeleton className="h-6 w-12 rounded-radius-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
