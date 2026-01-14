import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";

interface EnrollData {
  courseId: string;
  studentId: string;
}

export const useCourseEnroll = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ courseId, studentId }: EnrollData) => {
      const response = await fetchWithAuth(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to enroll student");
      }

      return { result, courseId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["enrolled-students", data.courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  return {
    enrollStudent: mutateAsync,
    isEnrolling: isPending,
  };
};
