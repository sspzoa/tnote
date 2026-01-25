import { Skeleton } from "@/shared/components/ui/skeleton";

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
