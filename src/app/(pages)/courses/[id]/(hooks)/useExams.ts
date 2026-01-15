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
      const response = await fetchWithAuth(`/api/exams?courseId=${courseId}`);
      const result = await response.json();
      const examsData = result.data || [];

      const examsWithStats = await Promise.all(
        examsData.map(async (exam: Exam) => {
          try {
            const scoresRes = await fetchWithAuth(`/api/exams/${exam.id}/scores`);
            const scoresResult = await scoresRes.json();
            if (scoresRes.ok && scoresResult.data?.scores?.length > 0) {
              const scores = scoresResult.data.scores.map((s: { score: number }) => s.score);
              const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
              const highest = Math.max(...scores);

              const sorted = [...scores].sort((a: number, b: number) => a - b);
              const mid = Math.floor(sorted.length / 2);
              const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

              const cutline = exam.cutline || 4;
              const belowCutlineCount = scores.filter((s: number) => s < cutline).length;

              return {
                ...exam,
                average_score: Math.round(avg * 10) / 10,
                highest_score: highest,
                median_score: Math.round(median * 10) / 10,
                below_cutline_count: belowCutlineCount,
                total_score_count: scores.length,
              };
            }
          } catch {}
          return {
            ...exam,
            average_score: null,
            highest_score: null,
            median_score: null,
            below_cutline_count: null,
            total_score_count: null,
          };
        }),
      );

      return examsWithStats as Exam[];
    },
    enabled: !!courseId,
  });

  return { exams: data ?? [], isLoading, error, refetch };
};
