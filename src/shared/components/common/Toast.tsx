"use client";

import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { CheckCircle, Info, X, XCircle } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export const toastsAtom = atomWithStorage<ToastMessage[]>("toasts", []);

const toastStyles: Record<ToastType, { bg: string; icon: typeof CheckCircle; iconColor: string }> = {
  success: {
    bg: "bg-solid-translucent-green border-solid-green",
    icon: CheckCircle,
    iconColor: "text-solid-green",
  },
  error: {
    bg: "bg-solid-translucent-red border-core-status-negative",
    icon: XCircle,
    iconColor: "text-core-status-negative",
  },
  info: {
    bg: "bg-core-accent-translucent border-core-accent",
    icon: Info,
    iconColor: "text-core-accent",
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = useAtom(toastsAtom);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col gap-spacing-300">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const style = toastStyles[toast.type];
  const Icon = style.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`pointer-events-auto flex items-center gap-spacing-300 rounded-radius-400 border px-spacing-500 py-spacing-400 backdrop-blur-sm ${style.bg}`}
      role="alert">
      <Icon className={`size-5 shrink-0 ${style.iconColor}`} />
      <span className="text-body text-content-standard-primary">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-spacing-200 shrink-0 rounded-radius-200 p-spacing-100 text-content-standard-tertiary transition-all duration-150 hover:bg-components-interactive-hover hover:text-content-standard-primary">
        <X className="size-4" />
      </button>
    </div>
  );
}
