import { useQuery } from "@tanstack/react-query";
import type { Course } from "../(atoms)/useCoursesStore";

export const useCourses = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await fetch("/api/courses");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch courses");
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
