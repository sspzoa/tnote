"use client";

import { type ReactNode, useEffect, useId } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
};

const maxWidthStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

export const Modal = ({ isOpen, onClose, title, subtitle, children, footer, maxWidth = "2xl" }: ModalProps) => {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-0 right-0 bottom-0 left-0 z-50 flex items-center justify-center bg-solid-black/60 p-spacing-400 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}>
      <div
        className={`flex max-h-[80vh] w-full ${maxWidthStyles[maxWidth]} flex-col overflow-hidden rounded-radius-600 border border-line-outline bg-components-fill-standard-primary`}
        onClick={(e) => e.stopPropagation()}>
        <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
          <h2 id={titleId} className="font-bold text-content-standard-primary text-heading">
            {title}
          </h2>
          {subtitle && <p className="mt-spacing-100 text-content-standard-secondary text-label">{subtitle}</p>}
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
};
