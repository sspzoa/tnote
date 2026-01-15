import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export interface Exam {
  id: string;
  course_id: string;
  exam_number: number;
  name: string;
  max_score: number;
  cutline: number;
  created_at: string;
  average_score?: number | null;
  highest_score?: number | null;
  median_score?: number | null;
  below_cutline_count?: number | null;
  total_score_count?: number | null;
  course: {
    id: string;
    name: string;
  };
}

export const useExams = (courseId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.exams.byCourse(courseId),
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/exams?courseId=${courseId}&include=stats`);
      const result = await response.json();
      return (result.data || []) as Exam[];
    },
    enabled: !!courseId,
  });

  return { exams: data ?? [], isLoading, error, refetch };
};
