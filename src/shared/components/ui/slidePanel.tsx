"use client";

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils/cn";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./sheet";

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  width?: "sm" | "md" | "lg";
}

const widthStyles = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
};

export function SlidePanel({ isOpen, onClose, title, subtitle, children, width = "md" }: SlidePanelProps) {
  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}>
      <SheetContent side="right" className={cn("gap-0", widthStyles[width])}>
        {(title || subtitle) && (
          <SheetHeader className="border-border border-b px-7 py-5">
            {title && <SheetTitle className="font-bold text-xl">{title}</SheetTitle>}
            {subtitle && <SheetDescription className="text-sm">{subtitle}</SheetDescription>}
          </SheetHeader>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
