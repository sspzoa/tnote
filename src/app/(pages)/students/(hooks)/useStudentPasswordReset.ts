import { createMutation } from "@/shared/lib/hooks";

const useReset = createMutation<string>({
  endpoint: (id) => `/api/students/${id}/reset-password`,
  method: "POST",
});

export const useStudentPasswordReset = () => {
  const { mutate, isPending } = useReset();
  return { resetPassword: mutate, isResetting: isPending };
};
