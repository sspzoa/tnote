import { Skeleton } from "@/shared/components/ui/skeleton";

interface ConsultationListSkeletonProps {
  count?: number;
}

/** Mirrors the consultation rows in ConsultationListModal once the list loads. */
export function ConsultationListSkeleton({ count = 4 }: ConsultationListSkeletonProps) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex flex-col gap-1 px-4 py-3.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="mt-1 h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}
