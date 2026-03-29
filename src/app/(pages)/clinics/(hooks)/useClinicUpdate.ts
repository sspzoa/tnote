import { createMutation } from "@/shared/lib/hooks";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface UpdateClinicData {
  clinicId: string;
  name: string;
  operatingDays: number[];
  startDate: string;
  endDate: string;
}

const useUpdate = createMutation<UpdateClinicData>({
  endpoint: (data) => `/api/clinics/${data.clinicId}`,
  method: "PATCH",
  invalidateKeys: [QUERY_KEYS.clinics.all, QUERY_KEYS.calendar.all],
});

export const useClinicUpdate = () => {
  const { mutate, isPending } = useUpdate();
  return { updateClinic: mutate, isUpdating: isPending };
};
