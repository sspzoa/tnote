import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface Submission {
  student: { id: string };
  status: string;
}

export const useAssignmentSubmissions = (assignmentId: string, enabled: boolean) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.assignments.submissions(assignmentId),
    queryFn: async () => {
      const res = await fetchWithAuth(`/api/assignments/${assignmentId}/submissions`);
      const result = await res.json();
      return (result.data || []) as Submission[];
    },
    enabled: enabled && !!assignmentId,
  });

  return { submissions: data ?? [], isLoading, error };
};

interface SaveSubmissionsParams {
  assignmentId: string;
  submissions: { studentId: string; status: string }[];
}

export const useAssignmentSubmissionsSave = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ assignmentId, submissions }: SaveSubmissionsParams) => {
      const response = await fetchWithAuth(`/api/assignments/${assignmentId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissions }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "제출 현황 저장에 실패했습니다.");
      }
    },
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignments.submissions(assignmentId) });
    },
  });

  return { saveSubmissions: mutateAsync, isPending };
};
