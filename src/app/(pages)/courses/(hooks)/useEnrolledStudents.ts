import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { Student } from "../(atoms)/useCoursesStore";

export const useEnrolledStudents = (courseId: string | null) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.students.enrolledInCourse(courseId || ""),
    queryFn: async () => {
      if (!courseId) return [];

      const response = await fetchWithAuth(`/api/courses/${courseId}/students`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "수강 학생 목록을 불러오는데 실패했습니다.");
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
