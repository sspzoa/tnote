"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";

export default function MessageTabSkeleton() {
  return (
    <div className="flex h-[700px] flex-row items-stretch gap-spacing-600">
      <div className="flex flex-1 flex-col rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
        <div className="flex flex-col gap-spacing-100 border-line-divider border-b px-spacing-500 py-spacing-400">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex items-center gap-spacing-300 border-line-divider border-b px-spacing-500 py-spacing-300">
          <Skeleton className="size-5 rounded-radius-100" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-spacing-300 p-spacing-500">
          <Skeleton className="h-12 w-full rounded-radius-300" />
          <div className="flex-1 flex flex-col gap-spacing-200 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-spacing-300 rounded-radius-300 border border-line-outline p-spacing-300">
                <Skeleton className="size-5 rounded-radius-100" />
                <div className="flex-1 flex flex-col gap-spacing-100">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
        <div className="flex flex-col gap-spacing-100 border-line-divider border-b px-spacing-500 py-spacing-400">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex items-center gap-spacing-300 border-line-divider border-b px-spacing-500 py-spacing-300">
          <Skeleton className="h-9 w-20 rounded-radius-300" />
          <Skeleton className="h-9 w-20 rounded-radius-300" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-spacing-400 px-spacing-500 py-spacing-400">
          <Skeleton className="min-h-0 flex-1 rounded-radius-300" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <div className="flex gap-spacing-200">
              <Skeleton className="h-12 w-24 rounded-radius-300" />
              <Skeleton className="h-12 w-24 rounded-radius-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
