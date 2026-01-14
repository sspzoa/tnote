import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import type { Course, Exam } from "../(atoms)/useRetakesStore";

export const useCoursesForAssign = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses-for-assign"],
    queryFn: async () => {
      const response = await fetchWithAuth("/api/exams");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "강좌 목록을 불러오는데 실패했습니다.");
      }

      const uniqueCourses = result.data.reduce((acc: Course[], exam: Exam) => {
        if (!acc.find((c) => c.id === exam.course.id)) {
          acc.push(exam.course);
        }
        return acc;
      }, []);

      return uniqueCourses as Course[];
    },
  });

  return {
    courses: data || [],
    isLoading,
    error,
  };
};
