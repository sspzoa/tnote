import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";

interface UpdateStudentData {
  id: string;
  name: string;
  phoneNumber: string;
  parentPhoneNumber?: string | null;
  school?: string | null;
  birthYear?: number | null;
}

export const useStudentUpdate = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ id, ...data }: UpdateStudentData) => {
      const response = await fetchWithAuth(`/api/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update student");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  return {
    updateStudent: mutateAsync,
    isUpdating: isPending,
  };
};
