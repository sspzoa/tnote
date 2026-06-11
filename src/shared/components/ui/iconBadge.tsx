import type { ComponentType } from "react";
import { cn } from "@/shared/lib/utils/cn";
import { type FeatureTone, toneWell } from "./featureTone";

type IconBadgeSize = "sm" | "md" | "lg";

const sizeStyles: Record<IconBadgeSize, string> = {
  sm: "size-8 rounded-md [&_svg]:size-4",
  md: "size-10 rounded-lg [&_svg]:size-5",
  lg: "size-12 rounded-lg [&_svg]:size-6",
};

interface IconBadgeProps {
  icon: ComponentType<{ className?: string }>;
  tone?: FeatureTone;
  size?: IconBadgeSize;
  className?: string;
}

/** A colored icon in a soft-tinted well — the recurring accent for avatars/section headers/list rows. */
export function IconBadge({ icon: Icon, tone = "primary", size = "md", className }: IconBadgeProps) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center", toneWell[tone], sizeStyles[size], className)}>
      <Icon />
    </span>
  );
}
