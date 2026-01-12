import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateCourseData {
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  daysOfWeek?: number[] | null;
}

export const useCourseCreate = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: CreateCourseData) => {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create course");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  return {
    createCourse: mutateAsync,
    isCreating: isPending,
  };
};
