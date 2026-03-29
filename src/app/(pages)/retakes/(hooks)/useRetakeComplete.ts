import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowComplete } from "@/shared/lib/workflow";

const useWorkflowComplete = createWorkflowComplete({
  baseEndpoint: "/api/retakes",
  invalidateKeys: [
    QUERY_KEYS.retakes.all,
    QUERY_KEYS.retakes.historyAll,
    QUERY_KEYS.calendar.all,
    QUERY_KEYS.home.stats,
    ["students", "detail"],
  ],
});

export const useRetakeComplete = () => {
  const { mutate, isPending } = useWorkflowComplete();
  return {
    completeRetake: ({ retakeId, data }: { retakeId: string; data: { note?: string | null } }) =>
      mutate({ id: retakeId, data }),
    isCompleting: isPending,
  };
};
