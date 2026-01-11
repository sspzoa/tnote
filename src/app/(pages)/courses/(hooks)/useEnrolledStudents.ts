import { useQuery } from "@tanstack/react-query";
import type { Student } from "../(atoms)/useCoursesStore";

export const useEnrolledStudents = (courseId: string | null) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["enrolled-students", courseId],
    queryFn: async () => {
      if (!courseId) return [];

      const response = await fetch(`/api/courses/${courseId}/students`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch enrolled students");
      }

      return result.data as Student[];
    },
    enabled: !!courseId,
  });

  return {
    enrolledStudents: data || [],
    isLoading,
    error,
    refetch,
  };
};
