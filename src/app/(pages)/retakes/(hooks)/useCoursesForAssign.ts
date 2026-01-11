import { useQuery } from "@tanstack/react-query";
import type { Course, Exam } from "../(atoms)/useRetakesStore";

export const useCoursesForAssign = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses-for-assign"],
    queryFn: async () => {
      const response = await fetch("/api/exams");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch courses");
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
