import { createMutation } from "@/shared/lib/hooks";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

const useDelete = createMutation<string>({
  endpoint: (id) => `/api/admins/${id}`,
  method: "DELETE",
  invalidateKeys: [QUERY_KEYS.admins.all],
});

export const useAdminDelete = () => {
  const { mutate, isPending } = useDelete();
  return { deleteAdmin: mutate, isDeleting: isPending };
};
