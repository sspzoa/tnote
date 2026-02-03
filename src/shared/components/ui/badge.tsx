import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
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
  success: "bg-solid-translucent-green text-core-status-positive border border-core-status-positive/20",
  warning: "bg-solid-translucent-yellow text-core-status-warning border border-core-status-warning/20",
  danger: "bg-solid-translucent-red text-core-status-negative border border-core-status-negative/20",
  info: "bg-core-accent-translucent text-core-accent border border-core-accent/20",
  neutral: "bg-components-fill-standard-secondary text-content-standard-secondary border border-line-outline",
};

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
  white: "bg-components-fill-standard-secondary text-content-standard-primary border border-line-outline",
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: "px-spacing-200 py-spacing-50 text-footnote",
  sm: "px-spacing-300 py-spacing-100 text-footnote",
  md: "px-spacing-300 py-spacing-100 text-label",
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
  const baseStyles = "inline-flex items-center rounded-radius-200 font-medium";
  const variantStyle = getVariantStyle(variant);
  const sizeStyle = sizeStyles[size];
  const interactiveStyle = interactive ? "cursor-pointer transition-opacity hover:opacity-80" : "";

  const combinedClassName = `${baseStyles} ${variantStyle} ${sizeStyle} ${interactiveStyle} ${className}`.trim();

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
