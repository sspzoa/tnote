import { useQuery } from "@tanstack/react-query";

export interface CourseForFilter {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
}

export const useCourses = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses-for-retakes-filter"],
    queryFn: async () => {
      const response = await fetch("/api/courses");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch courses");
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeCourses = result.data.filter((course: CourseForFilter) => {
        if (!course.start_date || !course.end_date) {
          return false;
        }
        const startDate = new Date(course.start_date);
        const endDate = new Date(course.end_date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        return today >= startDate && today <= endDate;
      });

      return activeCourses as CourseForFilter[];
    },
  });

  return {
    courses: data || [],
    isLoading,
    error,
  };
};
