"use client";

import type { LucideIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

interface SegmentedControlItem<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedControlProps<T extends string> {
  items: SegmentedControlItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Segmented control built on the shadcn Tabs primitives (used as a switcher; always one option selected). */
export function SegmentedControl<T extends string>({ items, value, onChange, className }: SegmentedControlProps<T>) {
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as T)} className={className}>
      <TabsList className="h-10 w-full">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <TabsTrigger key={item.value} value={item.value} className="text-sm">
              {Icon && <Icon className="size-4" />}
              {item.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
