import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

type EndpointSlug = "insufficient" | "not-submitted" | "absent";

const INVALIDATE_KEYS = [
  QUERY_KEYS.assignmentTasks.all,
  QUERY_KEYS.assignmentTasks.historyAll,
  QUERY_KEYS.calendar.all,
  QUERY_KEYS.home.stats,
  ["students", "detail"],
];

export const useAssignmentTaskSetStatus = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({
      taskId,
      endpoint,
      note,
    }: {
      taskId: string;
      endpoint: EndpointSlug;
      note?: string | null;
    }) => {
      const response = await fetchWithAuth(`/api/assignment-tasks/${taskId}/${endpoint}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note ?? null }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "요청에 실패했습니다.");
      return result.data;
    },
    onSuccess: () => {
      for (const key of INVALIDATE_KEYS) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });

  return {
    setStatus: mutateAsync,
    isPending,
  };
};
