import { createMutation } from "@/shared/lib/hooks";

const useReset = createMutation<string>({
  endpoint: (id) => `/api/admins/${id}/reset-password`,
  method: "POST",
});

export const useAdminResetPassword = () => {
  const { mutate, isPending } = useReset();
  return { resetPassword: mutate, isResetting: isPending };
};
