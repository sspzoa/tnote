import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { Exam } from "../(atoms)/useRetakesStore";

interface CourseBasic {
  id: string;
  name: string;
}

export const useCoursesForAssign = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.courses.forAssign,
    queryFn: async (): Promise<CourseBasic[]> => {
      const response = await fetchWithAuth("/api/exams");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "강좌 목록을 불러오는데 실패했습니다.");
      }

      const uniqueCourses = result.data.reduce((acc: CourseBasic[], exam: Exam) => {
        if (!acc.find((c) => c.id === exam.course.id)) {
          acc.push(exam.course);
        }
        return acc;
      }, []);

      return uniqueCourses;
    },
  });

  return {
    courses: data || [],
    isLoading,
    error,
  };
};
