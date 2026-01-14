import { useCourses as useCoursesBase } from "@/shared/hooks/useCourses";

export const useCourses = () => {
  return useCoursesBase({ activeOnly: false, queryKey: "courses" });
};
