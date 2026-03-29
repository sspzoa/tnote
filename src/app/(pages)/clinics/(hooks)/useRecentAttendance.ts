import { createQuery } from "@/shared/lib/hooks";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export interface RecentAttendanceItem {
  id: string;
  attendance_date: string;
  note: string | null;
  status: "attended" | "absent";
  did_retake_exam: boolean;
  did_homework_check: boolean;
  did_qa: boolean;
  is_required: boolean;
  student: { id: string; name: string; school: string | null };
  clinic: { id: string; name: string };
}

const useRecentAttendanceQuery = createQuery<RecentAttendanceItem[]>({
  queryKey: QUERY_KEYS.clinics.recentAttendance,
  endpoint: "/api/clinics/attendance/recent",
});

export const useRecentAttendance = () => {
  const { data, isLoading, error, refetch } = useRecentAttendanceQuery();
  return { recentAttendance: data, isLoading, error, refetch };
};
