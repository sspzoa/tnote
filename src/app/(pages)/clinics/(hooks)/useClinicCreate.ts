import { createMutation } from "@/shared/lib/hooks";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface CreateClinicData {
  name: string;
  operatingDays: number[];
  startDate: string;
  endDate: string;
}

const useCreate = createMutation<CreateClinicData>({
  endpoint: "/api/clinics",
  method: "POST",
  invalidateKeys: [QUERY_KEYS.clinics.all, QUERY_KEYS.calendar.all],
});

export const useClinicCreate = () => {
  const { mutate, isPending } = useCreate();
  return { createClinic: mutate, isCreating: isPending };
};
