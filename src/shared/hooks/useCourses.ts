import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { Course } from "@/shared/types";

interface UseCoursesOptions {
  activeOnly?: boolean;
}

export const useCourses = (options: UseCoursesOptions = {}) => {
  const { activeOnly = false } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: activeOnly ? QUERY_KEYS.courses.forStudentsFilter : QUERY_KEYS.courses.all,
    queryFn: async () => {
      const response = await fetchWithAuth("/api/courses");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "강좌 목록을 불러오는데 실패했습니다.");
      }

      if (activeOnly) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return result.data.filter((course: Course) => {
          if (!course.start_date || !course.end_date) {
            return false;
          }
          const startDate = new Date(course.start_date);
          const endDate = new Date(course.end_date);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);

          return today >= startDate && today <= endDate;
        }) as Course[];
      }

      return result.data as Course[];
    },
  });

  return {
    courses: data || [],
    isLoading,
    error,
    refetch,
  };
};
