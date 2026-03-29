import { createMutation } from "@/shared/lib/hooks";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface CreateCourseData {
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  daysOfWeek?: number[] | null;
}

const useCreate = createMutation<CreateCourseData>({
  endpoint: "/api/courses",
  method: "POST",
  invalidateKeys: [QUERY_KEYS.courses.all, QUERY_KEYS.calendar.all, QUERY_KEYS.home.stats],
});

export const useCourseCreate = () => {
  const { mutate, isPending } = useCreate();
  return { createCourse: mutate, isCreating: isPending };
};
