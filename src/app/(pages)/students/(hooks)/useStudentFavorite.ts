import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";

export const useStudentFavorite = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ studentId, isFavorite }: { studentId: string; isFavorite: boolean }) => {
      const response = await fetchWithAuth(`/api/students/${studentId}/favorite`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_favorite: isFavorite }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "즐겨찾기 업데이트에 실패했습니다.");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  return {
    toggleFavorite: mutateAsync,
    isToggling: isPending,
  };
};
