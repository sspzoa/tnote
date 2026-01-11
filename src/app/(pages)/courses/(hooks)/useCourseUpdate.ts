import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateCourseData {
  id: string;
  name: string;
}

export const useCourseUpdate = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ id, name }: UpdateCourseData) => {
      const response = await fetch(`/api/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update course");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  return {
    updateCourse: mutateAsync,
    isUpdating: isPending,
  };
};
