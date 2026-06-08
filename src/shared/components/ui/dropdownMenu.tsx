"use client";

import { EllipsisVertical } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem as DropdownMenuItemPrimitive,
  DropdownMenu as DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  dividerAfter?: boolean;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  /** Defaults to a ⋮ icon button. Pass a custom trigger element if needed (rendered via asChild). */
  trigger?: ReactNode;
  align?: "start" | "center" | "end";
}

/**
 * Self-contained Radix dropdown menu driven by an items[] array. It renders its own trigger
 * (a ⋮ icon button by default), so consumers no longer manage open state or positions.
 */
export function DropdownMenu({ items, trigger, align = "end" }: DropdownMenuProps) {
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
        {trigger ?? (
          <Button variant="ghost" size="icon" aria-label="더보기">
            <EllipsisVertical />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {items.map((item, index) => (
          <Fragment key={index}>
            <DropdownMenuItemPrimitive
              variant={item.variant === "danger" ? "destructive" : "default"}
              onSelect={item.onClick}>
              {item.label}
            </DropdownMenuItemPrimitive>
            {item.dividerAfter && <DropdownMenuSeparator />}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}
