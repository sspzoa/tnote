import { useQuery } from "@tanstack/react-query";
import type { Course } from "../(atoms)/useStudentsStore";

export const useCourses = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses-for-filter"],
    queryFn: async () => {
      const response = await fetch("/api/exams");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch courses");
      }

      const uniqueCourses = result.data.reduce((acc: Course[], exam: any) => {
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
