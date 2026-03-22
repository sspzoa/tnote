import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";

export interface MyClinicRecord {
  id: string;
  attendanceDate: string;
  note: string | null;
  status: "attended" | "absent";
  didRetakeExam: boolean;
  didHomeworkCheck: boolean;
  didQa: boolean;
  isRequired: boolean;
  clinic: {
    id: string;
    name: string;
  };
}

export const useMyClinicAttendance = (enabled: boolean) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["my", "clinics"],
    queryFn: async () => {
      const response = await fetchWithAuth("/api/my/clinics");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "클리닉 출석을 불러오는데 실패했습니다.");
      return result.data as MyClinicRecord[];
    },
    enabled,
  });

  return {
    records: data || [],
    isLoading,
    error,
  };
};
