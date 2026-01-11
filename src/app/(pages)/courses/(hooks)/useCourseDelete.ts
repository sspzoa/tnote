import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCourseDelete = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete course");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  return {
    deleteCourse: mutateAsync,
    isDeleting: isPending,
  };
};
