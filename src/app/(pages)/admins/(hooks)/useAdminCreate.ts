import { createMutation } from "@/shared/lib/hooks";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface CreateAdminData {
  name: string;
  phoneNumber: string;
}

const useCreate = createMutation<CreateAdminData>({
  endpoint: "/api/admins",
  method: "POST",
  invalidateKeys: [QUERY_KEYS.admins.all],
});

export const useAdminCreate = () => {
  const { mutate, isPending } = useCreate();
  return { createAdmin: mutate, isCreating: isPending };
};
