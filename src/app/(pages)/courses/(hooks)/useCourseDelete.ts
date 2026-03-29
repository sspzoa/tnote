import { createMutation } from "@/shared/lib/hooks";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

const useDelete = createMutation<string>({
  endpoint: (id) => `/api/courses/${id}`,
  method: "DELETE",
  invalidateKeys: [QUERY_KEYS.courses.all, QUERY_KEYS.calendar.all, QUERY_KEYS.home.stats],
});

export const useCourseDelete = () => {
  const { mutate, isPending } = useDelete();
  return { deleteCourse: mutate, isDeleting: isPending };
};
