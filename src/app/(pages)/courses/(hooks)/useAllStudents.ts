import { useQuery } from "@tanstack/react-query";
import type { Student } from "../(atoms)/useCoursesStore";

export const useAllStudents = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["all-students"],
    queryFn: async () => {
      const response = await fetch("/api/students");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch students");
      }

      return result.data as Student[];
    },
  });

  return {
    students: data || [],
    isLoading,
    error,
  };
};
