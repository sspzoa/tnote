import type React from "react";
import { cn } from "@/shared/lib/utils/cn";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  /** "narrow" centers content at a calmer reading width (for /my/* and detail screens). */
  width?: "default" | "narrow";
}

const widthClass = {
  default: "max-w-7xl",
  narrow: "max-w-3xl",
} as const;

export default function Container({ children, className = "", width = "default" }: ContainerProps) {
  return (
    <div className={cn("min-h-screen p-5 pb-24 md:p-8 md:pb-8", className)}>
      <div className={cn("mx-auto flex flex-col gap-7", widthClass[width])}>{children}</div>
    </div>
  );
}
