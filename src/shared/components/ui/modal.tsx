"use client";

import type { KeyboardEvent, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils/cn";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeStyles = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export function Modal({ isOpen, onClose, onSubmit, title, subtitle, children, footer, size = "lg" }: ModalProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onSubmit || event.key !== "Enter") return;
    // Guard against Enter fired while composing with a Korean/IME input.
    if (event.nativeEvent.isComposing) return;

    const target = event.target;
    if (
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLButtonElement ||
      target instanceof HTMLSelectElement
    ) {
      return;
    }

    event.preventDefault();
    onSubmit();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}>
      <DialogContent
        className={cn("flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 print:hidden", sizeStyles[size])}
        onKeyDown={handleKeyDown}>
        {(title || subtitle) && (
          <DialogHeader className="shrink-0 gap-1 border-border border-b px-6 py-4 text-left">
            {title && <DialogTitle className="text-lg">{title}</DialogTitle>}
            {subtitle && <DialogDescription className="text-sm">{subtitle}</DialogDescription>}
          </DialogHeader>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>

        {footer && (
          <DialogFooter className="shrink-0 gap-3 border-border border-t bg-muted/50 px-6 py-4 sm:justify-start">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
