import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowEditDate } from "@/shared/lib/workflow";

const useWorkflowEditDate = createWorkflowEditDate({
  baseEndpoint: "/api/retakes",
  invalidateKeys: [
    QUERY_KEYS.retakes.all,
    QUERY_KEYS.retakes.historyAll,
    QUERY_KEYS.calendar.all,
    ["students", "detail"],
  ],
});

export const useRetakeEditDate = () => {
  const { mutate, isPending } = useWorkflowEditDate();
  return {
    editDate: ({ retakeId, newDate }: { retakeId: string; newDate: string }) => mutate({ id: retakeId, newDate }),
    isEditing: isPending,
  };
};
