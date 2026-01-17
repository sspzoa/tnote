import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface Assignment {
  student: { id: string };
  status: string;
}

export const useExamAssignments = (examId: string, enabled: boolean) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.exams.assignments(examId),
    queryFn: async () => {
      const res = await fetchWithAuth(`/api/exams/${examId}/assignments`);
      const result = await res.json();
      return (result.data || []) as Assignment[];
    },
    enabled: enabled && !!examId,
  });

  return { assignments: data ?? [], isLoading, error };
};

interface SaveAssignmentsParams {
  examId: string;
  assignments: { studentId: string; status: string }[];
}

export const useExamAssignmentsSave = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ examId, assignments }: SaveAssignmentsParams) => {
      const response = await fetchWithAuth(`/api/exams/${examId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "과제 상태 저장에 실패했습니다.");
      }
    },
    onSuccess: (_, { examId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.exams.assignments(examId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.exams.export(examId) });
    },
  });

  return { saveAssignments: mutateAsync, isPending };
};
