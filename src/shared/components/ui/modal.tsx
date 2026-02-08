"use client";

import { type ReactNode, useCallback, useEffect, useId, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
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

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ isOpen, onClose, title, subtitle, children, footer, size = "lg" }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;

    const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, []);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      trapFocus(e);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    const timer = requestAnimationFrame(() => {
      const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      firstFocusable?.focus();
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      cancelAnimationFrame(timer);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, trapFocus]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-solid-black/60 p-spacing-400 backdrop-blur-sm print:hidden"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}>
      <div
        ref={dialogRef}
        className={`flex max-h-[80vh] w-full ${sizeStyles[size]} flex-col overflow-hidden rounded-radius-600 border border-line-outline bg-components-fill-standard-primary`}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-spacing-100 border-line-divider border-b px-spacing-600 py-spacing-500">
          <h2 id={titleId} className="font-bold text-content-standard-primary text-heading">
            {title}
          </h2>
          {subtitle && <p className="text-content-standard-secondary text-label">{subtitle}</p>}
        </div>

        <div className="flex-1 overflow-y-auto p-spacing-600">{children}</div>

        {footer && (
          <div className="flex gap-spacing-300 border-line-divider border-t bg-components-fill-standard-secondary/50 px-spacing-600 py-spacing-500">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
