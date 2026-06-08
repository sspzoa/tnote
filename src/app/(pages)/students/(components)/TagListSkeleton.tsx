import { Skeleton } from "@/shared/components/ui/skeleton";

interface TagListSkeletonProps {
  count?: number;
}

export function TagListSkeleton({ count = 4 }: TagListSkeletonProps) {
  return (
    <div className="flex flex-col gap-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-md border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-16 rounded-sm" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-14 rounded-md" />
            <Skeleton className="h-9 w-14 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
