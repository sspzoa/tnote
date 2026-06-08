import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils/cn";
import type { TagColor } from "@/shared/types";

type SemanticVariant = "success" | "warning" | "danger" | "info" | "neutral";

export type BadgeVariant = SemanticVariant | TagColor;

type BadgeSize = "xs" | "sm" | "md";

interface BaseBadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

interface StaticBadgeProps extends BaseBadgeProps, Omit<HTMLAttributes<HTMLSpanElement>, keyof BaseBadgeProps> {
  interactive?: false;
}

interface InteractiveBadgeProps
  extends BaseBadgeProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseBadgeProps> {
  interactive: true;
}

export type BadgeProps = StaticBadgeProps | InteractiveBadgeProps;

const semanticStyles: Record<SemanticVariant, string> = {
  success: "bg-success/10 text-success border border-success/20",
  warning: "bg-warning/10 text-warning border border-warning/20",
  danger: "bg-destructive/10 text-destructive border border-destructive/20",
  info: "bg-primary/10 text-primary border border-primary/20",
  neutral: "bg-muted text-muted-foreground border border-border",
};

// The 11-hue tag palette has no shadcn equivalent and is preserved as custom theme colors (solid-*).
const colorStyles: Record<TagColor, string> = {
  red: "bg-solid-translucent-red text-solid-red border border-solid-red/20",
  orange: "bg-solid-translucent-orange text-solid-orange border border-solid-orange/20",
  yellow: "bg-solid-translucent-yellow text-solid-yellow border border-solid-yellow/20",
  green: "bg-solid-translucent-green text-solid-green border border-solid-green/20",
  blue: "bg-solid-translucent-blue text-solid-blue border border-solid-blue/20",
  indigo: "bg-solid-translucent-indigo text-solid-indigo border border-solid-indigo/20",
  purple: "bg-solid-translucent-purple text-solid-purple border border-solid-purple/20",
  pink: "bg-solid-translucent-pink text-solid-pink border border-solid-pink/20",
  brown: "bg-solid-translucent-brown text-solid-brown border border-solid-brown/20",
  black: "bg-solid-translucent-black text-solid-black border border-solid-black/20",
  white: "bg-muted text-foreground border border-border",
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: "px-2 py-0.5 text-xs",
  sm: "px-3 py-1 text-xs",
  md: "px-3 py-1 text-sm",
};

const isSemanticVariant = (variant: BadgeVariant): variant is SemanticVariant => {
  return ["success", "warning", "danger", "info", "neutral"].includes(variant);
};

const getVariantStyle = (variant: BadgeVariant): string => {
  if (isSemanticVariant(variant)) {
    return semanticStyles[variant];
  }
  return colorStyles[variant];
};

export const Badge = ({
  variant = "neutral",
  size = "md",
  interactive,
  children,
  className = "",
  ...props
}: BadgeProps) => {
  const combinedClassName = cn(
    "inline-flex items-center rounded-md font-medium",
    getVariantStyle(variant),
    sizeStyles[size],
    interactive && "cursor-pointer transition-opacity hover:opacity-80",
    className,
  );

  if (interactive) {
    const { ...buttonProps } = props as Omit<InteractiveBadgeProps, keyof BaseBadgeProps | "interactive">;
    return (
      <button type="button" className={combinedClassName} {...buttonProps}>
        {children}
      </button>
    );
  }

  const { ...spanProps } = props as Omit<StaticBadgeProps, keyof BaseBadgeProps | "interactive">;
  return (
    <span className={combinedClassName} {...spanProps}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ variant, children }: { variant: SemanticVariant; children: ReactNode }) => {
  return (
    <Badge variant={variant} size="md">
      {children}
    </Badge>
  );
};
