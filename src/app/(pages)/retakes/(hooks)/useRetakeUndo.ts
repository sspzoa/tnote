import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowUndo } from "@/shared/lib/workflow";

const useWorkflowUndo = createWorkflowUndo({
  baseEndpoint: "/api/retakes",
  invalidateKeys: [QUERY_KEYS.retakes.all, QUERY_KEYS.retakes.historyAll, ["students", "detail"]],
});

export const useRetakeUndo = () => {
  const { mutate, isPending } = useWorkflowUndo();
  return {
    undoAction: ({ retakeId, historyId }: { retakeId: string; historyId: string }) =>
      mutate({ id: retakeId, historyId }),
    isUndoing: isPending,
  };
};
