import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { filterActiveCourses } from "@/shared/lib/utils/courses";

interface CourseBasic {
  id: string;
  name: string;
  end_date?: string | null;
}

interface ExamWithCourse {
  id: string;
  course: CourseBasic;
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

      const uniqueCourses = result.data.reduce((acc: CourseBasic[], exam: ExamWithCourse) => {
        if (!acc.find((c) => c.id === exam.course.id)) {
          acc.push(exam.course);
        }
        return acc;
      }, []);

      return filterActiveCourses(uniqueCourses);
    },
  });

  return {
    courses: data || [],
    isLoading,
    error,
  };
};
