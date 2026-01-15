import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export interface Student {
  id: string;
  name: string;
  phone_number: string;
  school: string | null;
}

export const useCourseStudents = (courseId: string, enabled: boolean) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.students.byCourse(courseId),
    queryFn: async () => {
      const res = await fetchWithAuth(`/api/courses/${courseId}/students`);
      const result = await res.json();
      return (result.data || []) as Student[];
    },
    enabled: enabled && !!courseId,
  });

  return { students: data ?? [], isLoading, error };
};
