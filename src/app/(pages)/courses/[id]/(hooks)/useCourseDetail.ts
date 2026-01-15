import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export interface Course {
  id: string;
  name: string;
  student_count?: number;
}

export const useCourseDetail = (courseId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.courses.detail(courseId),
    queryFn: async () => {
      const res = await fetchWithAuth(`/api/courses/${courseId}`);
      if (!res.ok) throw new Error("수업을 찾을 수 없습니다.");
      const result = await res.json();
      return result.data as Course;
    },
    enabled: !!courseId,
  });

  return { course: data, isLoading, error };
};
