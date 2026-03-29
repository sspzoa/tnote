import { createMutation } from "@/shared/lib/hooks";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

const useDelete = createMutation<string>({
  endpoint: (id) => `/api/students/${id}`,
  method: "DELETE",
  invalidateKeys: [QUERY_KEYS.students.all, QUERY_KEYS.consultations.all, QUERY_KEYS.home.stats],
});

export const useStudentDelete = () => {
  const { mutate, isPending } = useDelete();
  return { deleteStudent: mutate, isDeleting: isPending };
};
