import { useMutation } from "@tanstack/react-query";

export const useStudentPasswordReset = () => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await fetch(`/api/students/${studentId}/reset-password`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to reset password");
      }

      return result;
    },
  });

  return {
    resetPassword: mutateAsync,
    isResetting: isPending,
  };
};
