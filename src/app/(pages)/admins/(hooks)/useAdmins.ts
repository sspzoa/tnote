import { createQuery } from "@/shared/lib/hooks";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { Admin } from "../(atoms)/useAdminsStore";

const useAdminsQuery = createQuery<Admin[]>({
  queryKey: QUERY_KEYS.admins.all,
  endpoint: "/api/admins",
});

export const useAdmins = () => {
  const { data, isLoading, error, refetch } = useAdminsQuery();
  return { admins: data, isLoading, error, refetch };
};
