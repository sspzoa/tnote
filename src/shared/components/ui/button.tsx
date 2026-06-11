import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils/cn";

// Tactile controls: filled variants carry a soft top sheen + drop (--shadow-btn*) so they read as
// pressable objects, not flat color fills; press sinks the sheen + nudges scale.
const buttonVariants = cva(
  "relative inline-flex shrink-0 select-none items-center justify-center gap-1.5 rounded-lg font-semibold text-sm whitespace-nowrap outline-none transition-[transform,background-color,box-shadow,color,border-color] duration-[--motion-fast] ease-[--ease-spring] focus-visible:ring-[3px] focus-visible:ring-ring/45 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-btn-primary hover:bg-primary/93 hover:shadow-md active:shadow-xs",
        destructive:
          "bg-destructive text-white shadow-btn hover:bg-destructive/92 hover:shadow-md active:shadow-xs focus-visible:ring-destructive/35",
        success: "bg-success text-success-foreground shadow-btn hover:bg-success/92 hover:shadow-md active:shadow-xs",
        soft: "bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft hover:brightness-[0.97] active:brightness-95",
        outline:
          "border border-border bg-card text-foreground shadow-btn hover:border-border-strong hover:bg-accent active:shadow-xs",
        secondary: "bg-secondary text-secondary-foreground shadow-btn hover:bg-secondary/75 active:shadow-xs",
        translucent: "bg-primary/10 text-primary hover:bg-primary/16 active:bg-primary/20",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/70",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 has-[>svg]:px-3.5",
        xs: "h-7 gap-1 rounded-md px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 px-3.5 has-[>svg]:px-3",
        lg: "h-12 gap-2 px-6 text-base has-[>svg]:px-5",
        icon: "size-10",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isLoading?: boolean;
    loadingText?: string;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  isLoading = false,
  loadingText,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  const showSpinner = isLoading && !asChild;

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }), showSpinner && "[&>svg]:opacity-100")}
      disabled={disabled || (isLoading && !asChild)}
      {...props}>
      {showSpinner ? (
        <>
          <Loader2 className="animate-spin" />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
