import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export const useRetakeManagementStatus = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ retakeId, status }: { retakeId: string; status: string }) => {
      const response = await fetchWithAuth(`/api/retakes/${retakeId}/management-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ management_status: status }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "관리 상태 변경에 실패했습니다.");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.retakes.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.retakes.historyAll });
      queryClient.invalidateQueries({ queryKey: ["students", "detail"] });
    },
  });

  return {
    updateManagementStatus: mutateAsync,
    isUpdating: isPending,
  };
};
