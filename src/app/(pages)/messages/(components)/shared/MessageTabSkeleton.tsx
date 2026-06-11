"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";

export default function MessageTabSkeleton() {
  return (
    <div className="flex h-[700px] flex-row items-stretch gap-7">
      {/* Selection panel */}
      <div className="flex flex-1 flex-col rounded-xl border border-border bg-card shadow-xs">
        <div className="flex flex-col gap-1 border-border border-b px-4 py-2.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3.5 w-16" />
        </div>
        <div className="flex items-center gap-3 border-border border-b bg-muted/50 px-4 py-2.5">
          <Skeleton className="size-5 rounded-sm" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-2.5">
          <Skeleton className="h-9 w-full rounded-lg" />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border bg-muted">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 border-border border-b px-4 py-3">
                <Skeleton className="size-4 shrink-0 rounded-sm" />
                <div className="flex flex-1 flex-col gap-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3.5 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Message panel */}
      <div className="flex flex-1 flex-col rounded-xl border border-border bg-card shadow-xs">
        <div className="flex flex-col gap-1 border-border border-b px-4 py-2.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3.5 w-40" />
        </div>
        <div className="flex flex-col gap-3 border-border border-b px-4 py-2.5">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-16 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 py-2.5">
          <Skeleton className="min-h-0 flex-1 rounded-lg" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
