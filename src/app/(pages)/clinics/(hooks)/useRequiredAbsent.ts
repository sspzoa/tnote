import { createQuery } from "@/shared/lib/hooks";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export interface RequiredAbsentItem {
  id: string;
  attendance_date: string;
  note: string | null;
  student: { id: string; name: string; school: string | null };
  clinic: { id: string; name: string };
}

const useRequiredAbsentQuery = createQuery<RequiredAbsentItem[]>({
  queryKey: QUERY_KEYS.clinics.requiredAbsent,
  endpoint: "/api/clinics/attendance/required-absent",
});

export const useRequiredAbsent = () => {
  const { data, isLoading, error, refetch } = useRequiredAbsentQuery();
  return { requiredAbsent: data, isLoading, error, refetch };
};
