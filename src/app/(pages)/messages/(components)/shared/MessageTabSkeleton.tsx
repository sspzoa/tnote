"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";

export default function MessageTabSkeleton() {
  return (
    <div className="flex h-[700px] flex-row items-stretch gap-7">
      <div className="flex flex-1 flex-col rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-1 border-border border-b px-5 py-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex items-center gap-3 border-border border-b px-5 py-3">
          <Skeleton className="size-5 rounded-sm" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-5">
          <Skeleton className="h-12 w-full rounded-md" />
          <div className="flex flex-1 flex-col gap-2 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-md border border-border p-3">
                <Skeleton className="size-5 rounded-sm" />
                <div className="flex flex-1 flex-col gap-1">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-1 border-border border-b px-5 py-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex items-center gap-3 border-border border-b px-5 py-3">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 py-4">
          <Skeleton className="min-h-0 flex-1 rounded-md" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-12 w-24 rounded-md" />
              <Skeleton className="h-12 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
