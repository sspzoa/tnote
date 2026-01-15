import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";

export const useAdminResetPassword = () => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (adminId: string) => {
      const response = await fetchWithAuth(`/api/admins/${adminId}/reset-password`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "비밀번호 초기화에 실패했습니다.");
      }

      return result;
    },
  });

  return {
    resetPassword: mutateAsync,
    isResetting: isPending,
  };
};
