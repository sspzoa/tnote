import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowDelete } from "@/shared/lib/workflow";

const useWorkflowDelete = createWorkflowDelete({
  baseEndpoint: "/api/retakes",
  invalidateKeys: [
    QUERY_KEYS.retakes.all,
    QUERY_KEYS.retakes.historyAll,
    QUERY_KEYS.calendar.all,
    QUERY_KEYS.home.stats,
    ["students", "detail"],
  ],
});

export const useRetakeDelete = () => {
  const { mutate, isPending } = useWorkflowDelete();
  return { deleteRetake: mutate, isDeleting: isPending };
};
