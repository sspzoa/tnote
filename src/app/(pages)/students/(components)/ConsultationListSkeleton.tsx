import { Skeleton } from "@/shared/components/ui/skeleton";

interface ConsultationListSkeletonProps {
  count?: number;
}

export function ConsultationListSkeleton({ count = 4 }: ConsultationListSkeletonProps) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex flex-col gap-1 px-5 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-5 w-20 rounded-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
