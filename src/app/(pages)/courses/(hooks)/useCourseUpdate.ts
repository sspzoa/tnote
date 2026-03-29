import { createMutation } from "@/shared/lib/hooks";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface UpdateCourseData {
  id: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  daysOfWeek?: number[] | null;
}

const useUpdate = createMutation<UpdateCourseData>({
  endpoint: (data) => `/api/courses/${data.id}`,
  method: "PATCH",
  invalidateKeys: [QUERY_KEYS.courses.all, QUERY_KEYS.calendar.all],
});

export const useCourseUpdate = () => {
  const { mutate, isPending } = useUpdate();
  return { updateCourse: mutate, isUpdating: isPending };
};
