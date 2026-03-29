import { createQuery } from "@/shared/lib/hooks";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { Clinic } from "../(atoms)/useClinicsStore";

const useClinicsQuery = createQuery<Clinic[]>({
  queryKey: QUERY_KEYS.clinics.all,
  endpoint: "/api/clinics",
});

export const useClinics = () => {
  const { data, isLoading, error, refetch } = useClinicsQuery();
  return { clinics: data, isLoading, error, refetch };
};
