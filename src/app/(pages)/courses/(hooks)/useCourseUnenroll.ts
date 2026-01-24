import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface UnenrollData {
  courseId: string;
  studentId: string;
}

export const useCourseUnenroll = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ courseId, studentId }: UnenrollData) => {
      const response = await fetchWithAuth(`/api/courses/${courseId}/enroll`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to unenroll student");
      }

      return { result, courseId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.enrolledInCourse(data.courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.all });
    },
  });

  return {
    unenrollStudent: mutateAsync,
    isUnenrolling: isPending,
  };
};
