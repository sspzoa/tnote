import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";

interface CreateStudentData {
  name: string;
  phoneNumber: string;
  parentPhoneNumber?: string | null;
  school?: string | null;
  birthYear?: string | null;
}

export const useStudentCreate = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: CreateStudentData) => {
      const response = await fetchWithAuth("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create student");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  return {
    createStudent: mutateAsync,
    isCreating: isPending,
  };
};
