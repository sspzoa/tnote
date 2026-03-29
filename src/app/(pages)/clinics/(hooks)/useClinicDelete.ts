import { createMutation } from "@/shared/lib/hooks";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

const useDelete = createMutation<string>({
  endpoint: (id) => `/api/clinics/${id}`,
  method: "DELETE",
  invalidateKeys: [QUERY_KEYS.clinics.all, QUERY_KEYS.calendar.all],
});

export const useClinicDelete = () => {
  const { mutate, isPending } = useDelete();
  return { deleteClinic: mutate, isDeleting: isPending };
};
