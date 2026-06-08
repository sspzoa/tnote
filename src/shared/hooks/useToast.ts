import { toast } from "sonner";

// Thin wrapper kept so the 40+ existing useToast() call sites need no changes; delegates to sonner.
export const useToast = () => ({
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),
});
