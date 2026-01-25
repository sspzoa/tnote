import { Skeleton } from "@/shared/components/ui/skeleton";

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
