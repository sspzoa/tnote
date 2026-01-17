import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";

interface UpdateCourseData {
  id: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  daysOfWeek?: number[] | null;
}

export const useCourseUpdate = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ id, name, startDate, endDate, daysOfWeek }: UpdateCourseData) => {
      const response = await fetchWithAuth(`/api/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, startDate, endDate, daysOfWeek }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update course");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
    },
  });

  return {
    updateCourse: mutateAsync,
    isUpdating: isPending,
  };
};
