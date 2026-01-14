import { useSetAtom } from "jotai";
import { type ToastMessage, type ToastType, toastsAtom } from "@/shared/components/common/Toast";

export const useToast = () => {
  const setToasts = useSetAtom(toastsAtom);

  const addToast = (message: string, type: ToastType) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastMessage = { id, message, type };
    setToasts((prev) => [...prev, newToast]);
  };

  return {
    success: (message: string) => addToast(message, "success"),
    error: (message: string) => addToast(message, "error"),
    info: (message: string) => addToast(message, "info"),
  };
};
