"use client";

import { type ReactNode, useEffect, useId } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, subtitle, children, footer }: ModalProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/60 p-spacing-400 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}>
      <div
        className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
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
