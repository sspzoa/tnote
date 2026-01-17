import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

export interface ExportRow {
  name: string;
  parentPhone: string;
  assignmentStatus: string;
  score: number | null;
  rank: number | null;
}

interface ExamExportData {
  exam: {
    id: string;
    name: string;
    examNumber: number;
    maxScore: number;
    cutline: number;
    courseName: string;
  };
  rows: ExportRow[];
  totalCount: number;
}

export const useExamExport = (examId: string, enabled: boolean) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.exams.export(examId),
    queryFn: async () => {
      const res = await fetchWithAuth(`/api/exams/${examId}/export`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "데이터를 불러올 수 없습니다.");
      return result.data as ExamExportData;
    },
    enabled: enabled && !!examId,
  });

  return { exportData: data, isLoading, error };
};
